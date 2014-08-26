<?php
function error($txt)
{
  $json = (object)array(
    'code' => 1,
    'error' => $txt
  );

  die(json_encode($json));
}

function error_form($error_list)
{
  $json = (object)array(
    'code' => 2,
    'error_list' => $error_list
  );

  die(json_encode($json));
}

function check_data($con)
{
  $error_list = array();

  $p = $_POST;

  if (strlen($p['name']) > 10 || strlen($p['name']) < 2)
    array_push($error_list, 'name');
  $gender = intval($p['gender']);
  if ($gender > 3 || $gender < 0)
    array_push($error_list, 'gender');
  if (strlen($p['long']) <= 0)
    array_push($error_list, 'long');
  if (strlen($p['email']) <= 0)
    array_push($error_list, 'email');
  $first_chose = intval($p['first-chose']);
  if ($first_chose > 9 || 0 > $first_chose)
    array_push($error_list, 'first-chose');
  $second_chose = intval($p['second-chose']);
  if ($second_chose > 9 || 0 > $second_chose)
    array_push($error_list, 'second-chose');
  if (strlen($p['id']) <= 0)
    array_push($error_list, 'id');

  if (count($error_list) > 0)
    error_form($error_list);
}

function error_inject()
{
  $json = (object)array(
    'code' => -1
  );

  die(json_encode($json));
}

function check_inject()
{
  foreach(array('name', 'gender', 'long', 'short', 'email', 'first-chose', 'second-chose', 'id', 'grade', 'class') as $key)
  {
    if (strpos($_POST[$key], "'"))
      return true;
  }
  return false;
}

  $con = mysqli_connect('localhost','joinus-2014','joinus', 'joinus-2014');
  if (!$con)
    error('Cannot connect to Database');
  mysqli_set_charset ($con, 'utf-8');

  check_data($con);

  $inject = check_inject();

  // save attacker's infomation on purpose
  $query = 'INSERT INTO info (name, gender, long_num, short_num, email, first_chose, second_chose, sid, grade, class, question1, question2, question3, time, ua, ip, fill_duration, view_duration, injection) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now(), ?, ?, ?, ?, ?)';

  $stmt = $con->stmt_init();

  if ($stmt->prepare($query))
  {
    $zero = 0;
    $one = 1;
    $stmt->bind_param('sisssiissssssssiii', $_POST['name'], $_POST['gender'], $_POST['long'], $_POST['short'], $_POST['email'], $_POST['first-chose'], $_POST['second-chose'], $_POST['id'], $_POST['grade'], $_POST['class'], $_POST['question1'], $_POST['question2'], $_POST['question3'], $_SERVER['HTTP_USER_AGENT'], $_SERVER['X-Real-IP'], $_POST['fill-duration'], $_POST['view-duration'], $inject ? $one : $zero);
    $stmt->execute();
    $stmt->close();
  }
  else
    error('insert error' . $stmt->error);

  $id = mysqli_insert_id($con);
  $file_count = count($_FILES['upload']['name']);

  $query = "INSERT INTO uploads (id, original_name, file_name) VALUES (?, ?, ?)";

  $stmt = $con->stmt_init();

  if (! $stmt->prepare($query))
    error('file insert error'. $stmt-error);

  for ($i = 0; $i < $file_count; ++$i)
  {
    if ($_FILES['upload']['error'][$i] > 0)
      error('File ' . $_FILES['upload']['name'][$i] . ' Upload Error!');
    else
    {
      $file_name = tempnam('upload/', 'up');
      move_uploaded_file($_FILES['upload']['tmp_name'][$i], $file_name);

      $stmt->bind_param('iss', $id, $_FILES['upload']['name'][$i], $file_name);
      $stmt->execute();
    }
  }

  $stmt->close();

  if ($inject)
    error_inject();

  mysqli_close($con);
  
  $json = (object)array(
    'code' => 0
  );

  echo json_encode($json);
