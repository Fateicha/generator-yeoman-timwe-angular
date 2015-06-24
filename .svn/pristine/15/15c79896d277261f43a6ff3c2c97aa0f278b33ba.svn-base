<?php
$api = "<%= apiUrl %>"; // Staging
//$api = ""; // Production

/* TESTS */
//return var_dump(getallheaders());


$ch = curl_init();

curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 1);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_NOSIGNAL, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

if (isset($_POST['r']) && isset($_POST['l'])) {
    
    $today = getdate();
    
    $key = substr($today['yday'] . '73f8d4969098400c44dcb50111eb4193', 0, 32);
    $iv = substr($today['mday'] . '1234dcb50101d4966', 0, 16);
    
    $cipher = mcrypt_module_open(MCRYPT_RIJNDAEL_128, '', 'cbc', '');
    
    mcrypt_generic_init($cipher, $key, $iv);
    $decrypted = mdecrypt_generic($cipher, base64_decode($_POST['r']));
    mcrypt_generic_deinit($cipher);
    
    $decrypted = substr($decrypted, 0, $_POST['l']);
    $data = json_decode($decrypted, TRUE);
    
    $api .= $data['api'];
    unset($data['api']);
} else {
	// Avoid showing WP response if direct call is made to proxy
	if(!isset($_POST['a'])) return;
	
    if (isset($_POST['c'])) {
        $data = json_decode($_POST['c']);
        unset($_POST['c']);
    } else {
        $data = array();
    }
    $api .= $_POST['a'];
    unset($_POST['a']);
}

if (count($data) > 0) {

    array_walk_recursive($data, function (&$value, $key, $userdata)
    {
        if (isset($userdata[$key])) {
            $value = $userdata[$key];
        }
    }, $_POST);
    
    foreach($_POST as $key => $val)
        $data->$key = $val;
        
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
}

curl_setopt($ch, CURLOPT_URL, $api);

$result = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpcode >= 200 && $httpcode < 300) {

	if(isset($_REQUEST['a']) && $_REQUEST['a'] == 'pages/6'){

		/* Add the client IP */
		$result = json_decode($result);
		$result->timwe_client_ip = $ip = $_SERVER['REMOTE_ADDR'];
		
		/*
		 * Add the msisdn found in header if applicable
		 * 
		 * Get the name of the property where the msisdn will be passed
		 * If found assign it to msisdn_fwd
		 * Notes: 
		 * - Use getallheaders for backward compatibility.
		 * - The Iterations assume that when there is no direct msisdn forwarding
		 * the header values are unique by operator
		 * - If the turkcell headers are found a JSON object will be returned instead of the MSISDN
		 */ 
		$result->msisdn_fwd = 'NO_MSISDN_FWD';
		
		$msisdn_fwd_list = require_once 'msisdn_fwd_list.php';
		$all_headers = getallheaders();
		
		// Iterate trhough the operators
		foreach($msisdn_fwd_list as $k=>$v){
			
			$operator_id = $k;
			$params_list = $msisdn_fwd_list[$k]['header_msisdn_params'];
			// Use this for Turkcell
			$msisdn_opid_84 = array();
			
			// Iterate through the possible header parameters
			for($i=0,$cnt=count($params_list); $i!=$cnt; $i++){
				// Check if the listed headers exist in the http headers
				if(array_key_exists($params_list[$i], $all_headers)){
					$param_val = $all_headers[$params_list[$i]];
					// Check if it is Turkcell
					if($operator_id == 84){
						$msisdn_opid_84[] = $param_val;
						$result->msisdn_fwd = $msisdn_opid_84;
						
						/*
						 * Condition explanation:
						 * - Breaks iteration when all the header parameters are found for Turkcell
						 * - In case we only have the param to identify operator IP and we're not in Turkcell opearator,
						 * we won't assign a value to msisdn forward when we don't find the full param collection for 
						 * Turkcell
						 */ 
						if (count($result->msisdn_fwd) == $cnt && count($result->msisdn_fwd) > 1){
							$result->msisdn_fwd = json_encode($result->msisdn_fwd);
							break 2;
						}else{
							$result->msisdn_fwd = 'NO_MSISDN_FWD';
						}
					}else{
						if(is_numeric($param_val)){	
							$result->msisdn_fwd = $param_val;
							break 2;
						}
					}
				}
			}
		}
		/* TEST MSISDN Fwd */ //$result->msisdn_fwd = 5413894199;
		
		/* Add the Operator IP if it exists */
		if(array_key_exists('x-cluster-client-ip', $all_headers)){
			$result->operator_ip = $all_headers['x-cluster-client-ip'];
		}
		
		$result = json_encode($result);
	}

    echo $result;
    exit();
}

echo $httpcode; //echo $result;

