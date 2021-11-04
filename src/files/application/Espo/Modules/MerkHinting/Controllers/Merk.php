<?php
namespace Espo\Modules\MerkHinting\Controllers;

use Espo\Core\Exceptions\Forbidden;
use Espo\Core\Exceptions\BadRequest;

class Merk extends \Espo\Core\Controllers\Record
{
    public function getActionMerkAPI($params, $data, $request)
    {
        $token =  json_decode(file_get_contents(__DIR__ . "/../Resources/merk_token.json"))->token;
        $api_url = "https://api.merk.cz:443/suggest/";
        $request = curl_init($api_url . '?' . http_build_query($request->getQueryParams()));
        curl_setopt($request, CURLOPT_HTTPHEADER, array("Authorization: Token " . $token));
        curl_setopt($request, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($request, CURLOPT_RETURNTRANSFER, true);

        $data = curl_exec($request);
        curl_close($request);

        return $data;
    }
}
