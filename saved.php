<?php

require('database.php');

function error($txt)
{
  $json = (object)array(
    'code' => 1,
    'error' => $txt
  );

  die(json_encode($json));
}

  if (strlen($_POST['name']) * strlen($_POST['email'] * strlen($_POST['id'])))
  {
    $con = mysqli_connect('localhost', $database['username'], $database['password'], $database['database']);
    if (!$con)
      error('Cannot connect to Database');
    mysqli_set_charset ($con, 'utf-8');

    $query = 'SELECT * FROM info WHERE name = ? AND email = ? AND sid = ? ORDER BY id DESC LIMIT 1';

    $stmt = $con->stmt_init();

    if ($stmt->prepare($query))
    {
      $stmt->bind_param('sss', $_POST['name'], $_POST['email'], $_POST['id']);
      $stmt->execute();

      $result = $stmt->get_result();

      echo json_encode($result->fetch_object());
    }
    else
      error('Inserting error');

    $con->close();
  }
  else
    error('no param');
