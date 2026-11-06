<?php
// AI.ReMa 문의 폼 → 이메일 전달
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

const TO_ADDRESS   = 'yunjonghoon@gmail.com';
const FROM_ADDRESS = 'no-reply@airema.co.kr';
const MAX_PER_HOUR = 5; // IP당 시간당 최대 전송 횟수

function out($ok, $code = 200) {
    http_response_code($code);
    echo json_encode(['ok' => $ok]);
    exit;
}
function clean($v, $max) {
    $v = str_replace(["\r\n", "\r", "\0"], ["\n", "\n", ''], trim((string)$v));
    return mb_substr($v, 0, $max, 'UTF-8');
}
function oneline($v, $max) {
    return preg_replace('/\s+/u', ' ', clean($v, $max));
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') out(false, 405);

// 스팸 봇이 채우는 숨김 입력칸: 값이 있으면 성공처럼 응답하고 보내지 않음
if (!empty($_POST['website'])) out(true);

$topic   = oneline($_POST['topic'] ?? '', 100);
$company = oneline($_POST['company'] ?? '', 100);
$name    = oneline($_POST['name'] ?? '', 50);
$email   = oneline($_POST['email'] ?? '', 160);
$message = clean($_POST['message'] ?? '', 4000);
$lang    = in_array(($_POST['lang'] ?? 'ko'), ['ko', 'en', 'ja'], true) ? $_POST['lang'] : 'ko';

if ($topic === '' || $company === '' || $name === '' || $message === '') out(false, 400);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) out(false, 400);

// 간단한 전송 횟수 제한
$ip   = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$file = sys_get_temp_dir() . '/airema_contact_' . md5($ip) . '.json';
$now  = time();
$log  = [];
if (is_file($file)) {
    $log = json_decode((string)@file_get_contents($file), true) ?: [];
    $log = array_values(array_filter($log, function ($t) use ($now) { return $t > $now - 3600; }));
}
if (count($log) >= MAX_PER_HOUR) out(false, 429);
$log[] = $now;
@file_put_contents($file, json_encode($log));

$subject = '[AI.ReMa 문의] ' . $topic . ' - ' . $company;
$body = "협업 분야: $topic\n"
      . "회사 / 기관: $company\n"
      . "성함: $name\n"
      . "회신 이메일: $email\n"
      . "접수 언어: $lang\n"
      . "접수 시각: " . date('Y-m-d H:i:s') . "\n\n"
      . "문의 내용\n$message\n";

$headers = [
    'From: AI.ReMa Website <' . FROM_ADDRESS . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
];

// 5번째 인자(-f)로 봉투 발신자를 도메인 주소로 지정: 공유 호스팅에서 발송 거부/스팸 분류를 줄입니다.
$ok = mail(TO_ADDRESS, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, implode("\r\n", $headers), '-f' . FROM_ADDRESS);
out($ok, $ok ? 200 : 500);
