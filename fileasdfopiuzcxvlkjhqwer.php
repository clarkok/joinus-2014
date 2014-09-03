<?php

include('user_auth.php');
include('database.php');

if (!isset($_SERVER['PHP_AUTH_USER'])) {
  header('WWW-Authenticate: Basic realm="233"');
  header('HTTP/1.0 401 Unauthorized');
  echo "2333";
  exit;
}
else {
  if ($_SERVER['PHP_AUTH_USER'] === $user['user'] && $_SERVER['PHP_AUTH_PW'] === $user['password']) {
    $con = mysqli_connect($database['host'], $database['username'], $database['password'], $database['database']);
    mysqli_set_charset($con, 'utf8');
    $res = mysqli_query('SELECT * FROM upload WHERE id = ' . mysqli_real_escape_string($_REQUEST['id']));
    $row = mysqli_fetch_assoc($res);
    if ($row) {
      header('Content-Description: File Transfer');
      header('Content-Type: application/octet-stream');
      header('Content-Disposition: attachment; filename=' . $row['original_name']);
      header('Expires: 0');
      header('Cache-Control: must-revalidate');
      header('Pragma: public');
      header('Content-Length: ' . filesize($row['file_name']));
      readfile($row['file_name']);
      exit;
    }
    else {
      die('No such file');
    }
  }
}
