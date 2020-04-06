<?php
/**
 * Google spreadsheet parser
 *
 * @author Anton Lukin
 */


require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

class TheyGotCovid
{
    /**
     * Show error message
     */
    private static function halt_app($message = '', $success = false)
    {
        if ($success === false) {
            $message = "Error: {$message}";
        }

        exit($message);
    }

    /**
     * Get Google Sheets service
     */
    private static function get_service()
    {
        // Create google client
        $client = new Google_Client();
        $client->useApplicationDefaultCredentials();

        // Add only spreadsheets scope
        $client->addScope('https://www.googleapis.com/auth/spreadsheets');

        // Create new sheets service
        $service = new Google_Service_Sheets($client);

        return $service;
    }

    /**
     * Compress and scale photo
     */
    private static function compress_photo($path, $image)
    {
        $file = imagecreatefromstring($image);

        // Scale image
        $copy = imagescale($file, 600);

        // Save image using path
        if (!imagejpeg($copy, $path, 80)) {
            self::halt_app('Unable to save parsed photo: ' . $photo);
        }
    }

    /**
     * Download and update item photo
     */
    private static function update_photo($uri)
    {
        $file = md5($uri) . ".jpg";

        // Get photo file path
        $path = __DIR__ . "/public/photo/{$file}";

        if (!file_exists($path)) {
            $image = @file_get_contents($uri);

            if (!$image) {
                self::halt_app('Unable to download photo: ' . $uri);
            }

            self::compress_photo($path, $image);
        }

        // Get image size
        $size = getimagesize($path);

        // Create photo data
        return ['image' => "/photo/{$file}", 'width' => $size[0], 'height' => $size[1]];
    }

    /**
     * Parse titles from item
     */
    private static function parse_item($item, $output = [])
    {
        $mask = ['name:en', 'name:ru', 'bio:en', 'bio:ru', 'button:en', 'button:ru', 'link', 'status'];

        foreach ($mask as $i => $key) {
            $parts = explode(':', $key);

            if (count($parts) < 2) {
                $output[$key] = trim($item[$i]);
                continue;
            }

            list($name, $locale) = $parts;

            // Add title with locale
            $output['title'][$locale][$name] = trim($item[$i]);
        }

        // Update photo
        $output['photo'] = self::update_photo($item[8]);

        // Update status to lowercase
        $output['status'] = strtolower($output['status']);

        return $output;
    }

    /**
     * Handle parsed spreadsheet items
     */
    private static function process_items($items, $output = [])
    {
        foreach ($items as $item) {
            if (!empty($item[8])) {
                $output[] = self::parse_item($item);
            }
        }

        return $output;
    }

    /**
     * Try to get spreadsheet items
     */
    public static function get_items()
    {
        $spreadsheet = getenv('SHEET_ID');

        if (empty($spreadsheet)) {
            self::halt_app('Google spreadsheet id is empty');
        }

        $service = self::get_service();

        try {
            $response = $service->spreadsheets_values->get($spreadsheet, 'A2:I');

            if (empty($response->values)) {
                self::halt_app('Spreadsheet empty values');
            }

            $items = self::process_items($response->values);

        } catch (Exception $e) {
            self::halt_app($e->getMessage());
        }

        if (empty($items)) {
            self::halt_app('Something wrong with parsed data');
        }

        $output = json_encode($items, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        // Save data to file
        if(!file_put_contents(__DIR__ . '/config/data.json', $output)) {
            self::halt_app('Unable to save data.json file');
        }

        // Show halt message
        self::halt_app('Successfully parsed', true);
    }
}

/**
 * Let's start
 */
TheyGotCovid::get_items();
