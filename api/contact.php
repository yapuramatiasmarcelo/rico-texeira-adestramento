<?php

declare(strict_types=1);

ini_set("display_errors", "0");

const PRIVATE_INI = "/home1/ric59398/private/rico-contact.ini";
const RATE_DIR = "/home1/ric59398/private/rico-contact-rate";
const MAILBOX = "contato@ricoteixeiraadestramento.com.br";
const SMTP_HOST = "smtp.titan.email";
const SMTP_PORT = 465;
const RATE_LIMIT = 5;
const RATE_WINDOW = 900;

function respond(int $status, bool $ok, string $error = ""): void
{
    http_response_code($status);
    header("Content-Type: application/json; charset=utf-8");
    header("X-Robots-Tag: noindex, nofollow");
    header("Cache-Control: no-store");
    $payload = ["ok" => $ok];
    if (!$ok) {
        $payload["error"] = $error;
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function textLength(string $value): int
{
    if (function_exists("mb_strlen")) {
        return mb_strlen($value, "UTF-8");
    }
    return strlen($value);
}

function field(string $key): string
{
    if (!isset($_POST[$key]) || !is_string($_POST[$key])) {
        return "";
    }
    return str_replace("\0", "", $_POST[$key]);
}

function phoneDigits(string $value): string
{
    $digits = preg_replace("/\D/", "", $value) ?? "";
    if (strncmp($digits, "55", 2) === 0 && strlen($digits) >= 12) {
        $digits = substr($digits, 2);
    }
    if (isset($digits[0]) && $digits[0] === "0" && strlen($digits) >= 11) {
        $digits = substr($digits, 1);
    }
    return substr($digits, 0, 11);
}

function fakeLocal(string $local): bool
{
    if (preg_match("/^(\d)\1+$/", $local) === 1) {
        return true;
    }
    $rising = true;
    $falling = true;
    $length = strlen($local);
    for ($index = 1; $index < $length; $index++) {
        $diff = intval($local[$index]) - intval($local[$index - 1]);
        if ($diff !== 1) {
            $rising = false;
        }
        if ($diff !== -1) {
            $falling = false;
        }
    }
    return $rising || $falling;
}

function validPhone(string $value): bool
{
    $digits = phoneDigits($value);
    if (strncmp($digits, "41", 2) !== 0) {
        return false;
    }
    $local = substr($digits, 2);
    $mobile = preg_match("/^9\d{8}$/", $local) === 1;
    $landline = preg_match("/^[2-5]\d{7}$/", $local) === 1;
    if (!$mobile && !$landline) {
        return false;
    }
    return !fakeLocal($local);
}

function validSubmission(string $nome, string $email, string $telefone, string $mensagem, string $empresa): bool
{
    if ($empresa !== "") {
        return false;
    }
    if (preg_match("/[\r\n\x00-\x08\x0B\x0C\x0E-\x1F]/", $nome . $email) === 1) {
        return false;
    }
    $nomeLength = textLength(trim($nome));
    $messageLength = textLength(trim($mensagem));
    if ($nomeLength < 2 || $nomeLength > 80 || $messageLength < 10 || $messageLength > 2000) {
        return false;
    }
    if (textLength(trim($email)) > 120 || filter_var(trim($email), FILTER_VALIDATE_EMAIL) === false) {
        return false;
    }
    return validPhone($telefone);
}

function clientAddress(): string
{
    $address = $_SERVER["REMOTE_ADDR"] ?? "";
    return is_string($address) ? $address : "";
}

function tooManyAttempts(string $bucket): bool
{
    if (!is_dir(RATE_DIR) && !mkdir(RATE_DIR, 0700, true)) {
        respond(503, false, "Não foi possível enviar a consulta agora.");
    }
    $path = RATE_DIR . "/" . hash("sha256", $bucket);
    $handle = fopen($path, "c+");
    if ($handle === false) {
        respond(503, false, "Não foi possível enviar a consulta agora.");
    }
    try {
        if (!flock($handle, LOCK_EX)) {
            respond(503, false, "Não foi possível enviar a consulta agora.");
        }
        $raw = stream_get_contents($handle);
        $events = json_decode(is_string($raw) ? $raw : "", true);
        if (!is_array($events)) {
            $events = [];
        }
        $now = time();
        $recent = [];
        foreach ($events as $stamp) {
            if (is_int($stamp) && $stamp > $now - RATE_WINDOW) {
                $recent[] = $stamp;
            }
        }
        if (count($recent) >= RATE_LIMIT) {
            return true;
        }
        $recent[] = $now;
        rewind($handle);
        ftruncate($handle, 0);
        fwrite($handle, json_encode($recent));
        fflush($handle);
        @chmod($path, 0600);
        return false;
    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}

function smtpSettings(): array
{
    if (!is_file(PRIVATE_INI) || !is_readable(PRIVATE_INI)) {
        return [];
    }
    $permissions = fileperms(PRIVATE_INI);
    if ($permissions === false || ($permissions & 077) !== 0) {
        return [];
    }
    $settings = parse_ini_file(PRIVATE_INI, false, INI_SCANNER_RAW);
    if (!is_array($settings)) {
        return [];
    }
    $username = trim((string) ($settings["smtp_username"] ?? ""));
    $password = (string) ($settings["smtp_password"] ?? "");
    if (strcasecmp($username, MAILBOX) !== 0 || $password === "" || preg_match("/[\r\n]/", $password) === 1) {
        return [];
    }
    return ["username" => $username, "password" => $password];
}

if (($_SERVER["REQUEST_METHOD"] ?? "") !== "POST") {
    header("Allow: POST");
    respond(405, false, "Método não permitido.");
}

$nome = field("nome");
$email = field("email");
$telefone = field("telefone");
$mensagem = field("mensagem");
$empresa = field("empresa");
$address = clientAddress();
if ($address === "") {
    respond(503, false, "Não foi possível enviar a consulta agora.");
}
if (tooManyAttempts($address)) {
    respond(429, false, "Muitas tentativas em pouco tempo. Aguarde e tente de novo.");
}

if (!validSubmission($nome, $email, $telefone, $mensagem, $empresa)) {
    respond(422, false, "Os dados enviados não são válidos.");
}

$smtp = smtpSettings();
if ($smtp === []) {
    respond(503, false, "Não foi possível enviar a consulta agora.");
}

require __DIR__ . "/phpmailer/Exception.php";
require __DIR__ . "/phpmailer/PHPMailer.php";
require __DIR__ . "/phpmailer/SMTP.php";

$mail = new PHPMailer\PHPMailer\PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host = SMTP_HOST;
    $mail->Port = SMTP_PORT;
    $mail->SMTPAuth = true;
    $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
    $mail->SMTPAutoTLS = false;
    $mail->Username = $smtp["username"];
    $mail->Password = $smtp["password"];
    $mail->Timeout = 20;
    $mail->CharSet = PHPMailer\PHPMailer\PHPMailer::CHARSET_UTF8;
    $mail->SMTPDebug = 0;
    $mail->SMTPOptions = [
        "ssl" => [
            "verify_peer" => true,
            "verify_peer_name" => true,
            "allow_self_signed" => false,
        ],
    ];
    $mail->setFrom(MAILBOX, "Rico Teixeira Adestramento");
    $mail->addAddress(MAILBOX);
    $mail->addReplyTo(trim($email), trim($nome));
    $mail->Subject = "Consulta pelo site";
    $mail->Body = "Nome: " . trim($nome) . "\n"
        . "E-mail: " . trim($email) . "\n"
        . "Telefone: " . trim($telefone) . "\n\n"
        . trim($mensagem) . "\n";
    $mail->isHTML(false);
    if (!$mail->send()) {
        respond(503, false, "Não foi possível enviar a consulta agora.");
    }
} catch (Throwable $error) {
    respond(503, false, "Não foi possível enviar a consulta agora.");
}

respond(200, true);
