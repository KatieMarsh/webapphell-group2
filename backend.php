<?php
// สร้างการเชื่อมต่อกับฐานข้อมูล
$servername = "localhost";
$username = "root";
$password = "root";
$dbname = "web_room";

$conn = new mysqli($servername, $username, $password, $dbname);

// ตรวจสอบการเชื่อมต่อ
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// สร้างคำสั่ง SQL สำหรับดึงข้อมูล
$sql = "SELECT * FROM room";
$result = $conn->query($sql);

// ตรวจสอบว่ามีข้อมูลหรือไม่
if ($result->num_rows > 0) {
    // เริ่มต้นสร้าง JSON array เพื่อให้ข้อมูลถูกส่งไปยัง JavaScript
    $response = array();

    // Loop ทุกแถวของผลลัพธ์
    while($row = $result->fetch_assoc()) {
        // เพิ่มข้อมูลลงใน JSON array
        $response[] = $row;
    }

    // ส่ง JSON กลับไปยัง JavaScript
    echo json_encode($response);
} else {
    echo "0 results";
}

// ปิดการเชื่อมต่อฐานข้อมูล
$conn->close();
?>