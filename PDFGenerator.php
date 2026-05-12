<?php

namespace Utah\PDFGenerator;

use \REDCap as REDCap;

include_once "emLoggerTrait.php";

class PDFGenerator extends \ExternalModules\AbstractExternalModule {

    use emLoggerTrait;

    public $project_id = null;
    public $list_of_records = array();

    // TODO: If top-of-PDF priorities are combined, renamed, or re-iconed, update
    // this mapping first so the tile label/image and downstream lookup_content stay
    // in sync with the detailed PDF sections.
    // Will also need to see if *_p_score updates in REDCap are cascading down to the 
    // variables that are shown here
    private $lookup = [
        'dbt' => [
            'label' => 'Diabetes',
            'priority_field' => 'dbt_priority_numb_2',
            'default_priority' => 10,
            'top_three_field' => 'top_3___10',
            'ranking_field' => 'dbt_priority',
            'image' => 'diabetes.png',
            'lookup_content' => 'meta_action'
        ],
        'a1c' => [
            'label' => "Hemoglobin\nA1C",
            'priority_field' => 'a1c_priority_numb_2',
            'default_priority' => 4,
            'top_three_field' => 'top_3___4',
            'ranking_field' => 'a1c_priority',
            'image' => 'a1c.png',
            'lookup_content' => 'meta_action'
        ],
        'food' => [
            'label' => "Food & Nutrition",
            'priority_field' => 'food_priority_numb_2',
            'default_priority' => 6,
            'top_three_field' => 'top_3___6',
            'ranking_field' => 'food_priority',
            'image' => 'fast_food.png',
            'lookup_content' => 'nutr_action'
        ],
        'phys' => [
            'label' => 'Physical Activity',
            'priority_field' => 'phys_priority_numb_2',
            'default_priority' => 7,
            'top_three_field' => 'top_3___7',
            'ranking_field' => 'phys_priority',
            'image' => 'physical_activity.png',
            'lookup_content' => 'activity_action'
        ],
        'stress' => [
            'label' => 'Stress',
            'priority_field' => 'stress_priority_numb_2',
            'default_priority' => 9,
            'top_three_field' => 'top_3___9',
            'ranking_field' => 'stress_priority',
            'image' => 'stress.png',
            'lookup_content' => 'stress_action'
        ],
        'anxiety' => [
            'label' => 'Anxiety',
            'priority_field' => 'anxietypriority_numb_2',
            'default_priority' => 5,
            'top_three_field' => 'top_3___5',
            'ranking_field' => 'anxiety_priority',
            'image' => 'anxiety.png',
            'lookup_content' => 'anx_action'
        ],
        'depression' => [
            'label' => 'Depression',
            'priority_field' => 'depression_priority_numb_2',
            'default_priority' => 1,
            'top_three_field' => 'top_3___1',
            'ranking_field' => 'depression_priority',
            'image' => 'depression.png',
            'lookup_content' => 'phq_action'
        ],
        'substance' => [
            'label' => "Substance Use",
            'priority_field' => 'substance_priority_numb_2',
            'default_priority' => 2,
            'top_three_field' => 'top_3___2',
            'ranking_field' => 'substance_priority',
            'image' => 'drug_use.png',
            'lookup_content' => 'substance_action'
        ],
        'sleep' => [
            'label' => "Daytime\nSleepiness",
            'priority_field' => 'sleep_priority_numb_2',
            'default_priority' => 8,
            'top_three_field' => 'top_3___8',
            'ranking_field' => 'sleep_priority',
            'image' => 'sleep.png',
            'lookup_content' => 'sleep_action'
        ],
        'genhealth' => [
            'label' => 'General Health',
            'priority_field' => 'genhealth_priority_numb_2',
            'default_priority' => 11,
            'top_three_field' => 'top_3___11',
            'ranking_field' => 'genhealth_priority',
            'image' => 'general_health.png',
            'lookup_content' => 'gen_action'
        ],
        'pcp' => [
            'label' => "Primary Care\nProvider",
            'priority_field' => 'pcp_priority_numb_2',
            'default_priority' => 3,
            'top_three_field' => 'top_3___3',
            'ranking_field' => 'pcp_priority',
            'image' => 'primary_care_provider.png',
            'lookup_content' => 'gen_action'
        ],
        // 'no_answr' => [
        //     'label' => 'No Answers Provided',
        //     'priority_field' => 'no_answr',
        //     'default_priority' => 99,
        //     'top_three_field' => 'top_3___99',
        //     'ranking_field' => NULL,
        //     'lookup_content' => 'gen_action'
        // ],
    ];

    public function __construct() {
        parent::__construct();
    }

    function redcap_every_page_top($project_id) {
        $this->project_id = $project_id;
    }

    function redcap_survey_page($project_id, $record, $instrument) {
        if ($instrument == 'final_report') {
            echo $this->prepPdfGenerator($record);
        }

        if ($_SERVER['REQUEST_METHOD'] == 'POST') {

            // Parse required fields
            $pdfData    = !empty($_POST['pdfData'])     ? htmlspecialchars( $_POST['pdfData'], ENT_QUOTES) : "";
            $record_id  = !empty($_POST['record_id'])   ? htmlspecialchars( $_POST['record_id'], ENT_QUOTES) : "";
            $name       = !empty($_POST['name'])        ? htmlspecialchars( $_POST['name'], ENT_QUOTES) : "";
            $action     = !empty($_POST['action'])      ? htmlspecialchars( $_POST['action'], ENT_QUOTES) : "";

            if ($action == 'generate_pdf') {

                $currentDateTime = preg_replace('/[ :]/', '_', gmdate("Y-m-d H:i:s")) . '_UTC';

                $pdfFilePath = __DIR__ . '/generated_pdfs' . '/' . $record_id . '_' . $name . '_' . $currentDateTime. '.pdf';

                $response = $this->savePdfFile($pdfData, $pdfFilePath);

                if ($response === false) {
                    $this->emError("FAILED - Record ID: " . $record_id . " to save PDF file.");
                    return;
                } else {

                    $doc_id = $this->saveToEdocs($pdfFilePath);
                }

                if (!$doc_id) {
                    $this->emError("FAILED - Record ID: " . $record_id . " to save PDF to edocs.");
                    return;
                } else {
                    $response = $this->savePdfToFileField($record_id, $doc_id);
                }

                if ($response === false) {
                    $this->emError("FAILED - Record ID: " . $record_id . " to save PDF to file field.");
                } else {
                    unlink($pdfFilePath);
                }
            }
        }
    }

    function prepPdfGenerator($record_id) {
        $jsUrl = $this->getUrl('js/config.js');
        $centuryGothicNormalUrl = $this->getUrl('js/centurygothic-normal.js');
        $centuryGothicBoldUrl = $this->getUrl('js/centurygothic_bold-bold.js');
        $centuryGothicItalicUrl = $this->getUrl('js/centurygothic_italic-italic.js');

        $imageFileNames = array(
            'a1c.png',
            'alcohol.png',
            'anxiety.png',
            'artificial_beverages.png',
            'depression.png',
            'diabetes.png',
            'drug_use.png',
            'fast_food.png',
            'fruit_and_vegetable.png',
            'general_health.png',
            'header.png',
            'movement.png',
            'physical_activity.png',
            'primary_care_provider.png',
            'sleep.png',
            'stress.png',
            'sugary_beverages.png',
            'tobacco.png'
        );

        $imageUrls = array();
        foreach ($imageFileNames as $fileName) {
            $imageUrls[] = $this->getUrl('js/img/' . $fileName);
        }

        // TODO: If SDOH survey answers should appear in the PDF, make sure the
        // relevant survey/event data is available here so getPdfContent() can add it
        // to the same content payload used by the rest of the PDF.
        $record = $this->getCurrentRecordData($record_id);

        $name = $record[0]['first_name'] . " " . $record[0]['last_name'];

        $processed_data = $this->processPriorities($record);

        $goalsContent = $this->getPdfContent($record);
        // TODO: Extend getPdfContent() so SDOH-driven resources are included in this
        // existing content payload, using the same data source that feeds the rest of
        // the PDF sections.

        $tcpLink = $this->getTcpLink($record_id);

        // loading libraries
        $html  = '<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>';
        $html .= '<script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>';
        $html .= '<script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.2.6/purify.min.js"></script>';
        $html .= '<script src="' . $centuryGothicNormalUrl . '" type="module"></script>';
        $html .= '<script src="' . $centuryGothicBoldUrl . '" type="module"></script>';
        $html .= '<script src="' . $centuryGothicItalicUrl . '" type="module"></script>';
        // Add hidden inputs
        $html .= "<input type='hidden' id='pdf_record_id' value='$record_id'>";
        $html .= "<input type='hidden' id='pdf_name' value='$name'>";

        // Add JavaScript variables before loading config.js
        $html .= "<script>
            var PDF_RECORD_ID = '" . htmlspecialchars($record_id, ENT_QUOTES) . "';
            var PDF_NAME = '" . htmlspecialchars($name, ENT_QUOTES) . "';
        </script>";

        //keep the button for manual triggering, requested by study team
        $html .= "<div style='text-align:center; margin: 20px 0;'>
            <button type='button' class='btn btn-primary generate-pdf' data-record-id='$record_id' data-name='$name' style='color: #fff !important;'>Download Your Results</button>
        </div>";
        $html .= "<form id='action-form' name='action' class='hidden' method='POST'></form>";
        $html .= "<script src='$jsUrl'></script>";
        // TODO: Keep SDOH resources in this existing goalsContent argument once
        // getPdfContent() includes them, so config.js renders them from the same
        // source as the rest of the PDF.
        $html .= "<script>PDF.addEventHandlers(" . json_encode($record) . "," . json_encode($imageUrls) . "," . json_encode($goalsContent) . "," . json_encode($processed_data) . "," . json_encode($tcpLink) . ");</script>";

        return $html;
    }

    function getCurrentRecordData($record_id) {
        $params = array(
            'project_id' => $this->project_id,
            'records' => $record_id,
            'return_format' => 'json',
            // 'fields' => array(
            //             'record_id',
            //             'first_name',
            //             'last_name',
            //             'dbt_priority_numb_2',
            //             'a1c_priority_numb_2',
            //             'fastfood_priority_numb_2',
            //             'fruitveg_priority_numb_2',
            //             'sugarbev_priority_numb_2',
            //             'artbev_priority_numb_2',
            //             'phys_priority_numb_2',
            //             'stress_priority_numb_2',
            //             'anxietypriority_numb_2',
            //             'depression_priority_numb_2',
            //             'alcohol_priority_numb_2',
            //             'drugs_priority_numb_2',
            //             'tobacco_priority_numb_2',
            //             'sleep_priority_numb_2',
            //             'genhealth_priority_numb_2',
            //             'pcp_priority_numb_2',
            //             'no_answr',
            //             'top_3'
            //             )
          );
        $record = json_decode(\REDCap::getData($params), true);
        return $record;
    }

    function getTcpLink($record_id) {

        $instrument = "tcp_intake_survey";
        $event_id = REDCap::getEventIdFromUniqueEvent("fy_202627_arm_1");

        return \REDCap::getSurveyLink(
            $record_id,
            $instrument,
            $event_id
        );
    }

    /**
     * Process of "lookup" table
     * 1. grab OCIH priority, top three, and ranking values
     * 2. sort by priority value (lower number = higher priority)
     * 3. sort by top three value (1 = top three, NULL = not in top three)
     * 4. sort by ranking value (lower number = higher ranking, NULL = not ranked)
     * 5. return array of processed priorities
     */

    // TODO: dynamic header for employee identified goals vs OCIH goals ("This is a goal you selected" vs "We've identified this as a goal for you")

    // when rendering the PDF, either top 4 of the priorities, or the length of the priorities array, whichever is smaller

    // TODO: If the priority model changes, update the selection/sort/default-fill
    // logic here so the icon tiles reflect the new combined or renamed priorities.
    function processPriorities($record) {
        $priorities = [];

        $lookup = $this->lookup;
        $selected_labels = [];

        // Extract priority values for this record
        foreach ($lookup as $key => $element) {

            if($key == "no_answr") {
                continue;
            }

            $label = $element['label'];
            $priority_field = $element['priority_field'];
            $top_three_field = $element['top_three_field'];
            $ranking_field = $element['ranking_field'];
            $image_field = $element['image'];
            $lookup_content = $element['lookup_content'];

            // Using record[1] since that's the only event we're interested in
            if (!empty($record[1][$priority_field])) {
                $priority_value = (int)$record[1][$priority_field];
                $ranking_value = empty($record[1][$ranking_field]) ? NULL : (int)$record[1][$ranking_field];
                $top_three_value = empty($record[1][$top_three_field]) ? NULL : (int)$record[1][$top_three_field];

                $priorities[] = [
                    'field' => $priority_field,           // Original field name
                    'label' => $label,           // Human-readable label
                    'priority_value' => $priority_value,
                    'ranking_value' => $ranking_value,
                    'top_three_value' => $top_three_value,
                    'image' => $image_field,
                    'lookup_content' => $lookup_content,
                ];
                $selected_labels[] = $label;
            }
        }


        // Sort by priority value (lower number = higher priority)
        // Probably don't need to sort, but doing it just in case
        // Sort by priority values with NULLs at the end
        usort($priorities, function($a, $b) {
            return $a['priority_value'] - $b['priority_value'];
        });

        usort($priorities, function($a, $b) {
            // If both values are NULL, consider them equal
            if ($a['top_three_value'] === NULL && $b['top_three_value'] === NULL) {
                return 0;
            }

            // If only $a is NULL, move it to the end
            if ($a['top_three_value'] === NULL) {
                return 1;
            }

            // If only $b is NULL, move it to the end
            if ($b['top_three_value'] === NULL) {
                return -1;
            }

            // Both are non-NULL, sort normally
            return $a['top_three_value'] - $b['top_three_value'];
        });


        usort($priorities, function($a, $b) {
            // If both values are NULL, consider them equal
            if ($a['ranking_value'] === NULL && $b['ranking_value'] === NULL) {
                return 0;
            }

            // If only $a is NULL, move it to the end
            if ($a['ranking_value'] === NULL) {
                return 1;
            }

            // If only $b is NULL, move it to the end
            if ($b['ranking_value'] === NULL) {
                return -1;
            }

            // Both are non-NULL, sort normally
            return $a['ranking_value'] - $b['ranking_value'];
        });

        // If there are less than 4 priorities, fill in the rest with the lookup
        // item with the lowest default priorities till we have 4.
        if (count($priorities) < 4) {
            $default_priorities = array_filter($lookup, function($item) {
                return isset($item['default_priority']);
            });
            usort($default_priorities, function($a, $b) {
                return $a['default_priority'] - $b['default_priority'];
            });
            $default_priorities = array_values($default_priorities);
            foreach ($default_priorities as $default) {
                if ($default['label'] == "Primary Care\nProvider" && !($record[0]['provider'] == "1" || $record[1]['provider'] == "2")) {
                    continue;
                }
                $key = explode('_', $default['lookup_content'])[0];
                $is_green = $key . '_is_green';
                $physical_activity_is_green = "1";
                if($default['label'] == "Physical Activity" && $record[1][$is_green] == "") {
                    $physical_activity_is_green = "0";
                }
                if (!in_array($default['label'], $selected_labels) && ($record[1][$is_green] == "0" || $physical_activity_is_green == "0")) {
                    $priorities[] = [
                        'field' => $default['priority_field'],
                        'label' => $default['label'],
                        'priority_value' => $default['default_priority'],
                        'ranking_value' => NULL,
                        'top_three_value' => NULL,
                        'image' => $default['image'],
                        'lookup_content' => $default['lookup_content'],
                    ];
                    $selected_labels[] = $default['label'];
                    if (count($priorities) >= 4) {
                        break;
                    }
                }
            }
        }
        $healthy_defaults = ['sleep', 'stress', 'phys', 'food'];
        $healthy_defaults = array_map(function($item) use ($lookup) {
            return $lookup[$item];
        }, $healthy_defaults);
        if (count($priorities) < 4) {
            foreach ($healthy_defaults as $default) {
                if (!in_array($default['label'], $selected_labels)) {
                    $priorities[] = [
                        'field' => $default['priority_field'],
                        'label' => $default['label'],
                        'priority_value' => $default['default_priority'],
                        'ranking_value' => NULL,
                        'top_three_value' => NULL,
                        'image' => $default['image'],
                        'lookup_content' => $default['lookup_content'],
                    ];
                    $selected_labels[] = $default['label'];
                    if (count($priorities) >= 4) {
                        break;
                    }
                }
            }
        }

        return $priorities;
    }

    function getPdfContent($record) {
        // TODO: Add SDOH survey-driven resources here so they are returned in the
        // same content structure as the current PDF sections. If SDOH fields do not
        // follow the existing <prefix>_action/_yn/_is_green pattern, extend this
        // method's mapping logic rather than creating a separate payload.
        
        // save contents of lookup.json file into variable
        $lookupFilePath = __DIR__ . '/resources/lookup.json';
        $resourcesFilePath = __DIR__ . '/resources/resources.json';

        if (file_exists($lookupFilePath)) {
            $lookupContent = file_get_contents($lookupFilePath);
            $lookupData = json_decode($lookupContent, true);
        } else {
            $this->emError("Lookup file not found: " . $lookupFilePath);
            return '';
        }

        if (file_exists($resourcesFilePath)) {
            $resourcesContent = file_get_contents($resourcesFilePath);
            $resourcesData = json_decode($resourcesContent, true);
        } else {
            $this->emError("Resources file not found: " . $resourcesFilePath);
            return '';
        }

        // TODO: If priority groupings change upstream, keep the goalsContent mapping
        // aligned here so the detailed PDF descriptions match the updated top tiles.
        $goalsContent =  array();
        foreach ($lookupData as $key => $value) {

            $this->console_log("Processing key: " . $key);

            $green = $key . '_is_green';
            $action = $key . '_action';
            $yn = $key . '_yn';

            $user_choice = $record[1][$action] ? $record[1][$action] : "noansw";

            $this->console_log("User choice for $key: " . $user_choice);

            $user_yn = $record[1][$yn];
            $user_green = $record[1][$green];

            if ($user_choice == "noansw") {
                if ($user_yn == "0") {
                    $user_choice = "noaction";
                }
                else if ($user_green == "1" && ($key == "tobacco" || $key == "alcohol" || $key == "drug")){
                    continue;
                }
                else if ($user_yn == "1" && ($key == "tobacco" || $key == "alcohol" || $key == "drug")){
                    $user_choice = "noansw";
                }
                else if ($user_green == "1") {
                    $user_choice = "g_action";
                }
                else if ($user_green == null && ($key == "tobacco" || $key == "alcohol" || $key == "drug" || $key == "meta")) {
                    // its probably tobacco, alcohol, or drugs
                    // could also be meta
                    // skip because the user does not need resources for these
                    // maybe can handle this below, if content is empty
                    continue;
                }
            }

            $resourceKey = $key . '_' . $user_choice;

            // maybe add the continue if the resourceKey is not in the resourcesData
            $goalsContent[$action] = $resourcesData[$resourceKey];

            $goalsContent[$action]['label'] = $value['label'];
        }

        return $goalsContent;

    }

    function savePdfFile($base64Data, $filePath) {
        // Extract the base64 part (remove the data:application/pdf;base64, prefix)
        $base64Data = preg_replace('/^data:application\/pdf;filename=generated.pdf;base64,/', '', $base64Data);

        // Decode the base64 string
        $pdfContent = base64_decode($base64Data);

        // Save to file
        return file_put_contents($filePath, $pdfContent);
    }

    // Save PDF to REDCap edocs
    public function saveToEdocs($filePath) {
        $doc_id = \REDCap::storeFile($filePath, $this->project_id);
        return json_decode($doc_id, true);
    }

    // Save PDF with docid to file field
    public function savePdfToFileField($record_id, $doc_id) {
        $field_name = 'wellu_pdf';
        $event_id = $this->getEventId();

        return \REDCap::addFileToField(
            $doc_id,
            $this->project_id,
            $record_id,
            $field_name,
            $event_id
        );
    }

    public function console_log($data, $level = 'INFO') {
        $output = json_encode($data);
        echo "<script>console.log($output);</script>";

        $this->simple_log($output, $level);
    }

    public function simple_log($message, $level = 'INFO') {
        $logFile = __DIR__ . '/pdf_generator_log.txt';
        $timestamp = date('Y-m-d H:i:s');
        $formattedMessage = "[$timestamp][$level] $message\n";
        file_put_contents($logFile, $formattedMessage, FILE_APPEND);
    }

    /* methods below are needed for the page/pdfgenerator.php page to work */
    /* will delete once jsPDF testing is complete                          */

    // Get all records for this project
    function getRecords() {
        $params = array(
            'project_id' => $this->project_id,
            'return_format' => 'json',
            // 'fields' => 'record_id'
          );
        $records = json_decode(\REDCap::getData($params), true);
        $this->list_of_records = $records;
    }

    public function getOptions() {
        if (empty($this->list_of_records)) $this->getRecords();

        $html = '';
	    foreach ($this->list_of_records as $record) {

            $record_id= $record['record_id'];
            $name = $record['name'];

	        $html .= "<a class='dropdown-item' data-record-id='$record_id' data-name='$name' href='#'>" . $record_id . "</a>";
        }
        $html .= "<div class='dropdown-divider'></div>";
		$html .= "<div class='dropdown-header pdf-descriptive'>Create a record to have it appear here.</div>";
        return $html;
    }

    // function returnProcessedString($string) {
    //     $length = 50;

    //     $string = strip_tags2($string);
    //     if (strlen($string) > $length) {
    //         $string = substr($string,0,$length) . "...";
    //     }
    //     $string = preg_replace('/[\n\r]+/', " ", $string);
    //     return $string;
    // }

    private function includeJs($path){
        echo "<script type='text/javascript' src={$this->getUrl($path)}></script>";
    }

}
