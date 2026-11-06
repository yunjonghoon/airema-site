#!/usr/bin/env bash
# 아이레마 사이트의 한국어/영어/일본어 페이지가 서로 맞는지 점검한다.
# 사용: bash check_sync.sh [사이트 폴더]   (기본: 현재 폴더)
# 종료 코드: 0 = 문제 없음, 1 = 어긋남 발견
cd "${1:-.}" || exit 2
PAGES="index airema maista entertainment-ax sports-ax smb-ax"
problems=0
say() { echo "$1"; problems=$((problems+1)); }
count() { grep -o "$1" "$2" | wc -l | tr -d ' '; }
tags() { sed 's/<[^>]*>/\n/g' "$1"; }   # 태그를 지운 본문 텍스트
HANGUL='(*UTF8)[\x{AC00}-\x{D7A3}]'
KANA='(*UTF8)[\x{3040}-\x{30FF}]'

echo "== 1. 구조 비교 (같은 페이지의 ko/en/ja가 같은 모양인지)"
for p in $PAGES; do
  for tag in '<section' '<h2' '<h3' '<a ' '<img' '<li' '<button' '<input' '<textarea' '<option'; do
    k=$(count "$tag" $p.html); e=$(count "$tag" $p-en.html); j=$(count "$tag" $p-ja.html)
    if [ "$k" != "$e" ] || [ "$k" != "$j" ]; then say "  [구조] $p: '$tag' 개수 ko=$k en=$e ja=$j"; fi
  done
  e=$(count 'class="ai"' $p-en.html); j=$(count 'class="ai"' $p-ja.html)
  [ "$e" != "$j" ] && say "  [AI강조] $p: span.ai 개수 en=$e ja=$j (영/일은 같아야 함)"
done

echo "== 2. 번역 누락 (영/일 페이지에 한글, 영어 페이지에 일본어 가나가 남았는지)"
for p in $PAGES; do
  for s in en ja; do
    f=$p-$s.html
    # 언어 선택 상자(Language / 언어 / 言語, 한국어)는 의도된 한글이라 제외한다
    # 해동가적 낙관 이미지(origin-korean-seal, origin-hanja)는 원본 한글 표기를 일부러 유지하므로 제외한다
    rest=$(sed 's/<select class="language-switch".*<\/select>//' $f | tr '<' '\n' | grep -v 'class="origin-korean-seal"\|class="origin-hanja"' | grep -P "$HANGUL")
    [ -n "$rest" ] && say "  [한글남음] $f: $(echo "$rest" | head -2 | tr '\n' '|')"
  done
  if grep -qP "$KANA" $p-en.html; then say "  [일본어섞임] $p-en.html: 영어 페이지에 일본어 가나가 있음"; fi
  if [ "$(sed 's/<[^>]*>/ /g' $p.html | grep -cP "$KANA")" != 0 ]; then say "  [일본어섞임] $p.html: 한국어 페이지에 일본어 가나가 있음"; fi
done

echo "== 3. 언어 설정 (lang, hreflang, 언어 선택)"
for p in $PAGES; do
  for s in "" -en -ja; do
    f=$p$s.html; want=ko; [ "$s" = -en ] && want=en; [ "$s" = -ja ] && want=ja
    grep -q "<html lang=\"$want\"" $f || say "  [lang] $f: <html lang=\"$want\">가 아님"
    [ "$(count 'rel="alternate" hreflang' $f)" = 3 ] || say "  [hreflang] $f: hreflang이 3개가 아님"
    sw=$(grep -o '<select class="language-switch".*</select>' $f | sed 's/<\/select>.*/<\/select>/')
    [ "$(echo "$sw" | grep -o '<option value=' | wc -l | tr -d ' ')" = 3 ] || say "  [언어선택] $f: 언어 선택 option이 3개가 아님"
    grep -q "<option value=\"$p$s.html\" selected>" $f || say "  [언어선택] $f: 자기 언어가 selected가 아님"
  done
done

echo "== 4. 링크와 이미지 (언어판끼리 같은 곳을 가리키는지, 파일이 있는지)"
norm() { grep -o 'href="[^"]*"' "$1" | sed 's/-en\.html/.html/g; s/-ja\.html/.html/g' | sort; }
for p in $PAGES; do
  norm $p.html > /tmp/k.$$; norm $p-en.html > /tmp/e.$$; norm $p-ja.html > /tmp/j.$$
  diff -q /tmp/k.$$ /tmp/e.$$ >/dev/null || say "  [링크] $p: ko와 en의 링크 목록이 다름 → $(diff /tmp/k.$$ /tmp/e.$$ | grep '^[<>]' | head -2 | tr '\n' ' ')"
  diff -q /tmp/k.$$ /tmp/j.$$ >/dev/null || say "  [링크] $p: ko와 ja의 링크 목록이 다름 → $(diff /tmp/k.$$ /tmp/j.$$ | grep '^[<>]' | head -2 | tr '\n' ' ')"
  for s in "" -en -ja; do
    f=$p$s.html
    for ref in $(grep -oE '(src|href)="[^"#?]+\.(webp|png|jpg|mp4|woff2|css|js|html)' $f | sed 's/^[a-z]*="//' | sort -u); do
      case "$ref" in http*) continue;; esac
      [ -e "$ref" ] || say "  [파일없음] $f: $ref 파일이 없음"
    done
    n=$(grep -o '<img[^>]*>' $f | grep -vc 'alt="[^"]'); [ "$n" != 0 ] && say "  [alt] $f: alt 텍스트가 없는 이미지 $n개"
  done
done
rm -f /tmp/k.$$ /tmp/e.$$ /tmp/j.$$

echo "== 5. 캐시 값 (?v=)"
vals=$(cat *.html | grep -o '?v=[^"]*' | sort | uniq -c)
[ "$(echo "$vals" | wc -l | tr -d ' ')" -gt 1 ] && say "  [?v=] 값이 여러 개임:
$vals" || echo "  모두 같음: $(echo "$vals" | awk '{print $2}')"

echo "== 6. 번역 사전 (site.js의 한국어 문구가 language-data.js에 있는지)"
# currentLang===로 언어별 문구를 직접 고르는 줄(영상 버튼, 필터 안내)은 사전을 쓰지 않으므로 제외한다
grep -v 'currentLang===' site.js | grep -oP "(*UTF8)(?<=['\"])[^'\"\`\$]*[\x{AC00}-\x{D7A3}][^'\"\`\$]*(?=['\"])" | sort -u | while IFS= read -r str; do
  grep -qF "\"$str\"" language-data.js || echo "  [사전없음] \"$str\""
done > /tmp/dict.$$
if [ -s /tmp/dict.$$ ]; then problems=$((problems+$(wc -l < /tmp/dict.$$))); cat /tmp/dict.$$; fi
rm -f /tmp/dict.$$

echo
if [ "$problems" = 0 ]; then echo "결과: 문제 없음"; exit 0; else echo "결과: 문제 $problems건"; exit 1; fi
