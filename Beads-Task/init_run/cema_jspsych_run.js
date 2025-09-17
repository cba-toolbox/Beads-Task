function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        participantId: params.get('participantId'),
        researchContentId: params.get('researchContentId'),
        notificationId: params.get('notificationId'),
        researchDetailId: params.get('researchDetailId'),
    };
  }
  
// クエリパラメータを取得
const { participantId, researchContentId, notificationId, researchDetailId } = getQueryParams();
  
const jsPsych = initJsPsych({
    // Tell jsPsych to render the experiment in the div we created
    display_element: document.getElementById('jspsych-display-element'),
    timeline: timeline,
    on_finish: async function() {
        const resultJson = jsPsych.data.get().json();
        const resultData = JSON.parse(resultJson);
        const resultWithParticipantIdDataObject = {
            participantId: participantId,
            researchDetailId: researchDetailId,
            researchContentId: researchContentId,
            result: resultData,
        }
        const resultWithParticipantIdJson = JSON.stringify(resultWithParticipantIdDataObject);

        // 結果をAPIエンドポイントに送信
        const apiUrl = `https://cema.cpsy-lab.com/api/insert_psych_result`;
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    participantId: participantId,
                    researchContentId: researchContentId,
                    notificationId: notificationId,
                    result: resultWithParticipantIdJson,
                    researchDetailId: researchDetailId,
                }),
            });

            if (!response.ok) {
                console.log('!response.ok', response.status)
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseText = await response.text();
            console.log('Success:', responseText);
        } catch (error) {
            console.error('Error:', error);
            alert('処理中にエラーが発生しました。');
        } finally {
            const button = document.getElementById('finishButton');
            if (button) {
                button.style.display = 'inline-block';
            } else {
                console.error("Could not find finishButton even after moving it outside the display element.");
            }
        }
    }
});

jsPsych.run(timeline);

document.getElementById('finishButton').addEventListener('click', function() {
    window.close();
});