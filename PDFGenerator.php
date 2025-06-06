<?php

namespace Utah\PDFGenerator;

use \REDCap as REDCap;

class PDFGenerator extends \ExternalModules\AbstractExternalModule {
    public $project_id = null;
    public $list_of_records = array();

    private $lookup = [
        'dbt' => [
            'label' => 'History of Diabetes',
            'priority_field' => 'dbt_priority_numb_2',
            'top_three_field' => 'top_3___1',
            'ranking_field' => 'dbt_priority',
        ],
        'a1c' => [
            'label' => 'A1C',
            'priority_field' => 'a1c_priority_numb_2',
            'top_three_field' => 'top_3___2',
            'ranking_field' => 'a1c_priority',
        ],
        'fastfood' => [
            'label' => 'Fast Food / Snacks Intake',
            'priority_field' => 'fastfood_priority_numb_2',
            'top_three_field' => 'top_3___3',
            'ranking_field' => 'fastfood_priority',
        ],
        'fruitveg' => [
            'label' => 'Fruit & Vegetable Intake',
            'priority_field' => 'fruitveg_priority_numb_2',
            'top_three_field' => 'top_3___4',
            'ranking_field' => 'fruitveg_priority',
        ],
        'sugarbev' => [
            'label' => 'Sugar Sweetened Beverages Intake',
            'priority_field' => 'sugarbev_priority_numb_2',
            'top_three_field' => 'top_3___5',
            'ranking_field' => 'sugarbev_priority',
        ],
        'artbev' => [
            'label' => 'Artificially Sweetened Beverages Intake',
            'priority_field' => 'artbev_priority_numb_2',
            'top_three_field' => 'top_3___6',
            'ranking_field' => 'artbev_priority',
        ],
        'phys' => [
            'label' => 'Physical Activity',
            'priority_field' => 'phys_priority_numb_2',
            'top_three_field' => 'top_3___7',
            'ranking_field' => 'phys_priority',
        ],
        'stress' => [
            'label' => 'Stress',
            'priority_field' => 'stress_priority_numb_2',
            'top_three_field' => 'top_3___8',
            'ranking_field' => 'stress_priority',
        ],
        'anxiety' => [
            'label' => 'Anxiety',
            'priority_field' => 'anxietypriority_numb_2',
            'top_three_field' => 'top_3___9',
            'ranking_field' => 'anxiety_priority',
        ],
        'depression' => [
            'label' => 'Depression',
            'priority_field' => 'depression_priority_numb_2',
            'top_three_field' => 'top_3___10',
            'ranking_field' => 'depression_priority',
        ],
        'alcohol' => [
            'label' => 'Alcohol Consumption',
            'priority_field' => 'alchohol_priority_numb_2',
            'top_three_field' => 'top_3___11',
            'ranking_field' => 'alchohol_priority',
        ],
        'drugs' => [
            'label' => 'Drug Usage',
            'priority_field' => 'drugs_priority_numb_2',
            'top_three_field' => 'top_3___12',
            'ranking_field' => 'drugs_priority',
        ],
        'tobacco' => [
            'label' => 'Tobacco Usage',
            'priority_field' => 'tobacco_priority_numb_2',
            'top_three_field' => 'top_3___13',
            'ranking_field' => 'tobacco_priority',
        ],
        'sleep' => [
            'label' => 'Daytime Sleepiness',
            'priority_field' => 'sleep_priority_numb_2',
            'top_three_field' => 'top_3___14',
            'ranking_field' => 'sleep_priority',
        ],
        'genhealth' => [
            'label' => 'General Health Rating',
            'priority_field' => 'genhealth_priority_numb_2',
            'top_three_field' => 'top_3___15',
            'ranking_field' => 'genhealth_priority',
        ],
        'pcp' => [
            'label' => 'Primary Care Provider',
            'priority_field' => 'pcp_priority_numb_2',
            'top_three_field' => 'top_3___16',
            'ranking_field' => 'pcp_priority',
        ],
        'no_answr' => [
            'label' => 'No Answers Provided',
            'priority_field' => 'no_answr',
            'top_three_field' => 'top_3___99',
            'ranking_field' => NULL,
        ],
    ];

    public function __construct() {
        parent::__construct();
    }

    function redcap_every_page_top($project_id) {
        $this->project_id = $project_id;
    }

    function redcap_survey_page($project_id, $record, $instrument) {
        if ($instrument == 'pdf_placeholder') {
            echo $this->renderDownloadButton($record);
        }

        if ($_SERVER['REQUEST_METHOD'] == 'POST') {

            // Parse required fields
            $pdfData    = !empty($_POST['pdfData'])     ? htmlspecialchars( $_POST['pdfData'], ENT_QUOTES) : "";
            $record_id  = !empty($_POST['record_id'])   ? htmlspecialchars( $_POST['record_id'], ENT_QUOTES) : "";
            $name       = !empty($_POST['name'])        ? htmlspecialchars( $_POST['name'], ENT_QUOTES) : "";
            $action     = !empty($_POST['action'])      ? htmlspecialchars( $_POST['action'], ENT_QUOTES) : "";

            if ($action == 'generate_pdf') {
                $this->console_log("Generating PDF for record: " . $record_id . " with name: " . $name);
                $this->console_log("Action: " . $action);

                $this->console_log("PDF Data: " . $pdfData);

                $currentDateTime = preg_replace('/[ :]/', '_', gmdate("Y-m-d H:i:s")) . '_UTC';
                $this->console_log("Current Date and Time: " . $currentDateTime);

                $pdfFilePath = __DIR__ . '/generated_pdfs' . '/' . $record_id . '_' . $name . '_' . $currentDateTime. '.pdf';

                $response = $this->savePdfFile($pdfData, $pdfFilePath);

                if ($response === false) {
                    $this->console_log("Failed to save PDF file.");
                    return;
                } else {
                    $this->console_log("PDF file saved to following filesystem location: " . $pdfFilePath);

                    $doc_id = $this->saveToEdocs($pdfFilePath);
                    $this->console_log("PDF file saved to REDCap edocs with ID: " . $doc_id);
                }

                if (!$doc_id) {
                    $this->console_log("Failed to save PDF to REDCap edocs.");
                    return;
                } else {
                    $this->console_log("PDF file saved successfully to REDCap edocs.");
                    $response = $this->savePdfToFileField($record_id, $doc_id);
                }

                if ($response === false) {
                    $this->console_log("Failed to save PDF to file field.");
                } else {
                    $this->console_log("PDF file saved successfully to file field.");
                }
            } else {
                $this->console_log("Unknown action: " . $action);
            }
        }
    }

    function renderDownloadButton($record_id) {
        $jsUrl = $this->getUrl('js/config.js');
        $centuryGothicNormalUrl = $this->getUrl('js/centurygothic-normal.js');
        $centuryGothicBoldUrl = $this->getUrl('js/centurygothic_bold-bold.js');
        $centuryGothicItalicUrl = $this->getUrl('js/centurygothic_italic-italic.js');

        $imageFileNames = array(
            "a1c.png",
            "header.png",
            "mental_health.png",
            "movement.png",
            "sleep.png",
        );

        $imageUrls = array();
        foreach ($imageFileNames as $fileName) {
            $imageUrls[] = $this->getUrl('js/img/' . $fileName);
        }

        $record = $this->getCurrentRecordData($record_id);

        $this->console_log("Record data for ID $record_id: ");
        $this->console_log($record);

        $name = $record[0]['first_name'] . " " . $record[0]['last_name'];

        $processed_data = $this->processPriorities($record);
        $this->console_log("Processed priorities for record ID $record_id: ");
        $this->console_log($processed_data);

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

        //keep the button for manual triggering
        $html .= "<button type='button' class='btn btn-primary generate-pdf' data-record-id='$record_id' data-name='$name'>Download PDF</button>";
        $html .= "<form id='action-form' name='action' class='hidden' method='POST'></form>";
        $html .= "<script src='$jsUrl'></script>";
        $html .= "<script>PDF.addEventHandlers(" . json_encode($imageUrls) . ");</script>";

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

    /**
     * Process of "lookup" table
     * 1. grab OCIH priority, top three, and ranking values
     * 2. sort by priority value (lower number = higher priority)
     * 3. sort by top three value (1 = top three, NULL = not in top three)
     * 4. sort by ranking value (lower number = higher ranking, NULL = not ranked)
     * 5. return array of processed priorities
     */

    // TODO: Will need to add default display for when no priorities are set
    // TODO: dynamic header for employee identified goals vs OCIH goals ("This is a goal you selected" vs "We've identified this as a goal for you")

    // when rendering the PDF, either top 4 of the priorities, or the length of the priorities array, whichever is smaller

    function processPriorities($record) {
        $priorities = [];

        $lookup = $this->lookup;

        // Extract priority values for this record
        foreach ($lookup as $key => $element) {

            $label = $element['label'];
            $priority_field = $element['priority_field'];
            $top_three_field = $element['top_three_field'];
            $ranking_field = $element['ranking_field'];

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
                    'top_three_value' => $top_three_value
                ];
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

        return $priorities;
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

    function returnProcessedString($string) {
        $length = 50;

        $string = strip_tags2($string);
        if (strlen($string) > $length) {
            $string = substr($string,0,$length) . "...";
        }
        $string = preg_replace('/[\n\r]+/', " ", $string);
        return $string;
    }

    private function includeJs($path){
        echo "<script type='text/javascript' src={$this->getUrl($path)}></script>";
    }

}
