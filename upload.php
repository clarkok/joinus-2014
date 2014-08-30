<?php
require('database.php');
function error($text) {
  $json = (object)array(
    'code' => 1,
    'error' => $text
  );
  die(json_encode($json));
}

  $error_list = array();

  if (strlen($_POST['id']) <= 0)
    error('No ID');

  $con = mysqli_connect($database['host'],$database['username'],$database['password'], $database['database']);
  if (!$con)
    error('Cannot connect to Database');
  mysqli_set_charset ($con, 'utf8');

  $query = 'INSERT INTO upload (sid, original_name, file_name) VALUES (?, ?, ?)';

  $stmt = $con->stmt_init();

  $file_count = count($_FILES['upload']['name']);

  if (! $stmt->prepare($query))
    error('Insert error');

  for ($i = 0; $i < $file_count; ++$i) {
    if ($_FILES['upload']['error'][$i]) {
      array_push($error_list, $_FILES['upload']['name'][$i]);
      continue;
    }
    $filename = tempnam('./upload', 'up_');
    move_uploaded_file($_FILES['upload']['tmp_name'][$i], $filename);
    $stmt->bind_param('sss', $_POST['id'], $_FILES['upload']['name'][$i], $filename);
    $stmt->execute();
  }

  $stmt->close();

  if (count($error_list)) {
    $json = (object)array(
      'code' => 2,
      'error_list' => $error_list
    );
  }
  else {
    $json = (object)array(
      'code' => 0
    );
  }

  echo json_encode($json);
