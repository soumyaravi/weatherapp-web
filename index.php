<?php
header('Access-Control-Allow-Origin: http://cs-server.usc.edu:52629');
    $street = test_input($_GET['street']);
    $city = test_input($_GET['city']);
    $state = test_input($_GET['states']);
    $degree = test_input($_GET['degree']);

    if($degree == "Fahrenheit")
        $unit = "us";
    else
        $unit = "si";
    $url= "http://maps.google.com/maps/api/geocode/xml?address=" . urlencode($street) . "," . urlencode($city) . "," . urlencode($state); 
    $datas['url']=$url;
    //for google geocode
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $response = new SimpleXMLElement(curl_exec($ch)); //retrieves xml file
    
    $status = $response->status;
    $geometry = $response->result[0]->geometry;
    $latitude = $geometry->location->lat;   
    $longitude = $geometry->location->lng;
    
    //for forecast.io api
    $weather= "https://api.forecast.io/forecast/b1199c9341302800bd29e2cc92ea908a/$latitude,$longitude?units=$unit&exclude=flags"; 
    $content = file_get_contents($weather);
    $output = json_decode($content,true);
function test_input($data) {
       $data = trim($data);
       $data = stripslashes($data);
       $data = htmlspecialchars($data);
       return $data;
    }

    echo json_encode($output);
?>