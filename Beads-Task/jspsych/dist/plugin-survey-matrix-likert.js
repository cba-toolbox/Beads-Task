/**
 * plugin-survey-matrix-likert jsPsych plugin
 * 
 * jsPsych plugin for gathering responses to questions on a matrix form of the Likert scale.
 * This plugin is modified with plugin-survey-likert.js in jsPsych-7.0.0.
 * Version: 211127
 */
var jsPsychSurveyMatrixLikert = (function (jspsych) {
  'use strict';

  const info = {
    name: "survey-matrix-likert",
    parameters: {
      /** Array containing one or more objects with parameters for the question(s) that should be shown on the page. */
      questions: {
        type: jspsych.ParameterType.COMPLEX,
        array: true,
        pretty_name: "Questions",
        nested: {
          /** Question prompt. */
          prompt: {
            type: jspsych.ParameterType.HTML_STRING,
            pretty_name: "Prompt",
            default: undefined,
          },
          /** Whether or not a response to this question must be given in order to continue. */
          required: {
            type: jspsych.ParameterType.BOOL,
            pretty_name: "Required",
            default: false,
          },
          /** Name of the question in the trial data. If no name is given, the questions are named Q0, Q1, etc. */
          name: {
            type: jspsych.ParameterType.STRING,
            pretty_name: "Question Name",
            default: "",
          },
          /** Specify a reverse question item if true. */
          reverse_item: {
            type: jspsych.ParameterType.BOOL,
            pretty_name: "Reverse question item",
            default: false,
          }
        },
      },
      /** If true, the order of the questions in the 'questions' array will be randomized. */
      randomize_question_order: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Randomize Question Order",
        default: false,
      },
      /** Array of likert labels to display for every question. */
      scale: {
        type: jspsych.ParameterType.OBJECT,
        pretty_name: "Scale",
        default: undefined,
      },
      /** Alignment of the column headers. Specify 'top', 'center', or 'bottom'.*/
      column_header_alignment: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Column header alignment",
        default: 'bottom',
      },
      /** HTML-formatted string to display at top of the page above all of the questions. */
      preamble: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Preamble",
        default: null,
      },
      /** Width of the likert scales in pixels. */
      cellpadding: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Table cell padding",
        default: 16,
      },
      /** Label of the button to submit responses. */
      button_label: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Button label",
        default: "Continue",
      },
      /** Setting this to true will enable browser auto-complete or auto-fill for the form. */
      autocomplete: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Allow autocomplete",
        default: false,
      }
    },
  };
  
  /**
   * **survey-matrix-likert**
   *
   * jsPsych plugin for gathering responses to questions on a matrix form of the Likert scale.
   */
  class SurveyMatrixLikertPlugin {

    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {

      // Get the token for the column header alignment.
      let column_header_alignment;
      switch (trial.column_header_alignment.toLowerCase()) {
        case 'top':
          column_header_alignment = 'left';
          break;
        case 'center':
          column_header_alignment = 'center';
          break;
        default:
          column_header_alignment = 'right';
          break;
      } 

      // Inject CSS for trial.
      let html = '';
      html += `<style id="jspsych-survey-likert-css">
        .jspsych-survey-likert-column-header { 
          text-align: ${column_header_alignment};
          -ms-writing-mode: tb-rl;
          writing-mode: vertical-rl;
          display: inline-block;
        }
        .jspsych-survey-likert-row-header { 
          text-align: left;
          font-weight: normal;
        }
        .jspsych-survey-likert-table {
          border-collapse: collapse;
          margin: 0 auto 20px auto;
        }
        .jspsych-survey-likert-cell {
          border-style: solid;
          border-color: gray;
          border-width: 1px 0;
          padding: ${trial.cellpadding}px;
        }</style>`;
      
      // Show a preamble text.
      if (trial.preamble !== null) {
        html += `<div id="jspsych-survey-likert-preamble" 
          class="jspsych-survey-likert-preamble" 
          style="margin: 10px 0 20px 0; text-align: left;">${trial.preamble}</div>`;
      }

      // Set the form autocompletion.
      const str = trial.autocomplete ? '' : 'autocomplete="off"';
      html += `<form id="jspsych-survey-likert-form" ${str}>`;

      // Set a question order.
      let question_order = [];
      for (let i = 0; i < trial.questions.length; i++) {
        question_order.push(i);
      }
      if (trial.randomize_question_order) {
        question_order = this.jsPsych.randomization.shuffle(question_order);
      }

      // Make a questionnaire table.
      html += '<table class="jspsych-survey-likert-table"><tr><td></td>';
      for (let key in trial.scale) {
        html += '<td><div id="A' + trial.scale[key] + '" class="jspsych-survey-likert-column-header">' + 
        key + '</div></td>';
      }
      html += '</tr>'
      for (let i = 0; i < trial.questions.length; i++) {
        const question = trial.questions[question_order[i]];
        const question_name = 'Q' + question_order[i];
        html += '<tr><th class="jspsych-survey-likert-row-header jspsych-survey-likert-cell" data-name=' + 
          question.name + ' data-radio-group=' + question_name + '>' + question.prompt + '</th>'
        for (let key in trial.scale) {  
          html += '<td class="jspsych-survey-likert-cell"><input type="radio" name=' + question_name + 
            ' value=' + trial.scale[key];
          html += question.required ? ' required></td>' : '></td>';
        }
        html += '</tr>'
      }
      html += '</table>';

      // Add a submit button.
      html += `<input type="submit" id="jspsych-survey-likert-next" class="jspsych-survey-likert jspsych-btn" 
        value=${trial.button_label}></input>`;
      html += "</form>";

      // Set an HTML text to show a Likert-scale questinnaire.
      display_element.innerHTML = html;
      
      // Reset the height of the table column header divs to their maximum height.
      let maxHeight = 0;
      for (let key in trial.scale) {
        let height = document.getElementById('A' + trial.scale[key]).clientHeight;
        if (height > maxHeight) {
          maxHeight = height;
        }
      }
      for (let key in trial.scale) {
        document.getElementById('A' + trial.scale[key]).style.height = maxHeight + 'px';
      }
      
      // Get an answer from the questinnaire.
      display_element.querySelector("#jspsych-survey-likert-form").addEventListener("submit", (e) => {
        e.preventDefault();

        // Measure a response time.
        const endTime = performance.now();
        const response_time = Math.round(endTime - startTime);

        // Create an object to hold responses.
        let question_data = {};
        const matches = display_element.querySelectorAll(
          "#jspsych-survey-likert-form .jspsych-survey-likert-row-header");
        for (let index = 0; index < matches.length; index++) {
          const id = matches[index].dataset["radioGroup"];
          const selected_radio_button = display_element.querySelector(
            'input[name="' + id + '"]:checked');
          const name = (matches[index].attributes["data-name"].value !== "") ? 
            matches[index].attributes["data-name"].value : id;
          let obj = {};
          obj[name] = (selected_radio_button === null) ? NaN : parseInt(selected_radio_button.value);
          Object.assign(question_data, obj);
        }

        // Save the trial data.
        const trial_data = {
          rt: response_time,
          response: question_data,
          question_order: question_order,
          questions: trial.questions,
          scale: trial.scale,
        };

        // Clear the task screen.
        display_element.innerHTML = "";

        // Go to the next trial.
        console.log(trial_data)
        this.jsPsych.finishTrial(trial_data);
      });
      var startTime = performance.now();
    }
  }
  SurveyMatrixLikertPlugin.info = info;

  return SurveyMatrixLikertPlugin;

})(jsPsychModule);
