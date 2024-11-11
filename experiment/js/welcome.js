

var welcome = {};

// --------------  things that vary from task to task --------------

welcome.task = {};
welcome.task.blurb = 'We welcome you to this short psychological study investigating how people make decisions.';
welcome.task.time = '20–30 minutes';
welcome.task.pay = 'US$1.50';

// --------------  things that vary between ethics approvals --------------

welcome.ethics = {};
welcome.ethics.name = 'Learning from decision-dependent experience';
welcome.ethics.about = 'The research study aims to examine how people learn about different options to make decisions.';
welcome.ethics.who = 'The study is being carried out by the following researchers: Professor Thomas Hills, Jan Antkiewicz and Diya Malhotra from the Department of Psychology at University of Warwick.';
welcome.ethics.inclusion = 'Not applicable.';
welcome.ethics.haveTo = 'Participation in this research study is voluntary. If you do not want to take part, you do not have to. If you decide to take part and later change your mind, you are free to withdraw from the study at any stage.';
welcome.ethics.risks = 'If you decide to take part in the research study, we will ask you to complete an cognitive task, where you will have to press a button based on what you see on the screen and a simple decision making task in the form of a game. In this game, you will choose whether or not to select different options, over a repeated number of choices. The whole, will take approximately '+ welcome.task.time +'. <br>The risks associated with this study are no more than those experienced on a daily basis. We don’t expect this research to cause any harm.';
welcome.ethics.time = 'In total, participation in this study will require ' + welcome.task.time + '. This will include one single session in which you will complete the cognitive and decision making task described above.';
welcome.ethics.recompense = 'You will be eligable to enter a lottery with a pool of 4 amazon vouchers each worth 15 pounds, by imputing your email at the end of the experiment. Your chances of winning the lottery will increase based on your performance of the second task (the decision game), but it will not be possible to reassociate your email to the data.' ;
welcome.ethics.benefits = 'We cannot promise that you will receive any benefits from this study, but we hope to use the findings from this study to further our understanding of the factors influencing people’s decisions, and under which conditions they may learn best.';
welcome.ethics.information = 'The collected data will be used exclusively for conducting and analyzing the research study, with us acting as the data controller. During the data collection period, your data in an anonymized format will be stored securely on the password-protected University OneDrive. The data will only be accessed by the researchers and supervisors named above and will not be shared with any other organisations. Future research use of this data will require approval from an independent Research Ethics Committee and your consent obtained at the research projects outset. Access, modification, or movement of your information is limited for the sake of research accuracy and reliability. The University of Warwick has established policies and procedures to ensure data security.<br>' +
'For more details, refer to the University’s Privacy notice for research at <a href="https://warwick.ac.uk/services/idc/dataprotection/privacynotices/researchprivacynotice">link</a>, or contact the Information and Data Compliance Team at GDPR@warwick.ac.uk.';

welcome.ethics.results = 'The research team intend to publish and/ report the results of the research study in a variety of ways. All information published will be done in a way that will not identify you. If you would like to receive a copy of the results you can let the research team know by sending them your email address via email. We will only use these details to send you the results of the research.  ';
welcome.ethics.withdraw = '<p>If you do consent to participate, you may withdraw at any time. You do not have to give any reason for withdrawing.  However, please let the researcher know electronically, through contacting either of the researchers using the emails provided below.</p>'+
                          '<p>If you do consent to participate, you may withdraw at any time. You can do this by closing the task. If you withdraw from the research, we will destroy any information has already been collected. Once you have submitted your responses however, we will not be able to delete them as the task is anonymous. </p>' +
                          '<p>Your decision not to participate or to withdraw from the study will not affect your relationship with UNSW Sydney. If you decide to withdraw from the research study, the researchers will not collect additional information from you. Any identifiable information about you will be withdrawn from the research project. </p>';
welcome.ethics.questions = 'If you require further information regarding this study or if you have any problems which may be related to your involvement in the study, you can contact the following member/s of the research team: <br><br><b>Name: </b>Professor Thomas Hills<br><b>Email:</b> t.t.hills@warwick.ac.uk<br><br><b>Name: </b>Jan Antkiewicz<br><b>Email:</b> jan.antkiewicz@warwick.ac.uk<br><br><b>Name: </b>Diya Malhotra<br><b>Email:</b> diya.malhotra@warwick.ac.uk';
welcome.ethics.complaints = 'If you wish to raise a complaint on how we have handled your personal data, you can contact our Data Protection Officer who will investigate the matter: DPO@warwick.ac.uk.';

// ----------------------- function to start the task ------------------
welcome.run = function() {
    document.getElementById("welcome").innerHTML =
        welcome.section.header +
        welcome.section.start +
        welcome.section.consent +
        welcome.section.demographics;
}

// ------------- actions to take at the end of each click ----------------
welcome.click = {};
welcome.click.start = function() {
    welcome.helpers.setDisplay('start', 'none');
    welcome.helpers.setDisplay('consent', '');
    welcome.helpers.setHeader(' ');
}
welcome.click.consent = function() {
    welcome.helpers.setDisplay('consent', 'none');
    welcome.helpers.setDisplay('demographics', '');
    welcome.helpers.setHeader(' ');
}
welcome.click.demographics = function() {
    jsPsych.data.addProperties({  // record the condition assignment in the jsPsych data
        gender: document.getElementById("gender").value,
        age: document.getElementById("age").value,
        country: document.getElementById("country").value,
        email: document.getElementById("email").value,
});

if (
    (document.getElementById("gender").value !== '') &&
    (document.getElementById("age").value !== '') &&
    (document.getElementById("country").value !== '')
    ) {
        welcome.helpers.setDisplay('demographics', 'none');
        welcome.helpers.setDisplay('header', 'none');
        startExperiment(); // start the jsPsych experiment
        } else {
        alert('Please complete all compulsory fields marked *.');
        return;
        }
    }

// ------------- html for the various sections ----------------
welcome.section = {};
welcome.section.header =
    '<!-- ####################### Heading ####################### -->' +
    '<a name="top"></a>' +
    '<h1 style="text-align:center; width:1000px" id="header" class="header">' +
    '   &nbsp; Warwick University Psychology Lab</h1>';

welcome.section.start =
    '<!-- ####################### Start page ####################### -->' +
    '<div class="start" style="width: 900px">' +
    '<div class="start" style="text-align:left; border:0px solid; padding:10px;' +
    '                          width:800px; float:right; font-size:90%">' +
    welcome.task.blurb + ' <br><br>The study involves the following steps:</p>' +
    '<ol>' +
    '<li> Consent form' +
    '<li> Basic demographic information</li>' +
    '<li> Instructions for task 1, followed by the task <br></li>' +
    '<li> Instructions for task 2, followed by the task<br></li>' +
    '<li> Debriefing section, with an opportunity to give your email, so you can be entered into the lottery<br></li>' +
    '</ol>' +
    '<p>The total time taken should be about ' + welcome.task.time + '. Please <u>do not</u> use the "back" ' +
    '   button on your browser or close the window until you reach the end' +
    '. This is very likely to break the experiment. When you are ready to begin, click on' +
    '   the "start" button below.</p>' +
    '<!-- Next button for the splash page -->' +
    '<p align="center"> <input type="button" id="splashButton" class="start jspsych-btn" ' +
    'value="Start!" onclick="welcome.click.start()"> </p>' +
    '</div>' +
    '</div>';

welcome.section.consent =
    '	<!-- ####################### Consent ####################### -->' +
    '	<div class="consent" style="display:none; width:900px">' +
    '		<!-- Text box for the splash page -->' +
    '		<div class="consent" style="text-align:left; border:0px solid; padding:10px;  width:800px; font-size:90%; float:right">' +
    '			<p align="center"><b>UNIVERISTY OF WARWICK<br>' +
    '			PARTICIPANT INFORMATION</b><br><br>' + welcome.ethics.name + '</p>' +
    '			<p><b>1. What is the research study about?</b></p>' +
    '			<p>' + welcome.ethics.about + '</p>' +
    '			<p><b>2. Who is conducting this research?</b></p>' +
    '			<p>' + welcome.ethics.who + '</p>' +
    '			<p><b>3. Inclusion/Exclusion Criteria</b></p>' +
    '			<p>' + welcome.ethics.inclusion + '</p>' +
    '			<p><b>4. Do I have to take part in this research study?</b></p>' +
    '			<p>' + welcome.ethics.haveTo + '</p>' +
    '			<p><b>5. What does participation in this research require, and are there any risks involved?</b></p>' +
    '			<p>' + welcome.ethics.risks + '</p>' +
    '			<p><b>6. Total participation time</b></p>' +
    '			<p>' + welcome.ethics.time + '</p>' +
    '			<p><b>7. Recompense to participants</b></p>' +
    '			<p>' + welcome.ethics.recompense + '</p>' +
    '			<p><b>8. What are the possible benefits to participation?</b></p>' +
    '			<p>' + welcome.ethics.benefits + '</p>' +
    '			<p><b>9. What will happen to information about me?</b></p>' +
    '			<p>' + welcome.ethics.information + '</p>' +
    '			<p><b>10. How and when will I find out what the results of the research study are?</b></p>' +
    '			<p>' + welcome.ethics.results + '</p>' +
    '			<p><b>11. What if I want to withdraw from the research study?</b></p>' +
    '			<p>' + welcome.ethics.withdraw + '</p>' +
    '			<p><b>12. What should I do if I have further questions about my involvement in the research study?</b></p>' +    
    '			<p>' + welcome.ethics.questions + '</p>' +
    '           ' +
    '			<p><b>13. What if I have a complaint or any concerns about the research study?</b></p>' +
    '			<p>' + welcome.ethics.complaints + '</p>' +
    '           ' +
    '			<br>' +
    '			<p align="center"><b>PARTICIPANT CONSENT</b></p>' +
    '			By continuing, you are making a decision whether or not to participate.  Clicking the button below indicates that, having read the information provided on the participant information sheet, you have decided to participate, and declare the following: <br> ' +
    '			<br>' +
    '           <li>I confirm that I have read and understand the information sheet for the above study. </li>'+
    '           <li>I have had an opportunity to ask questions and I am satisfied with the answers I have received;</li>'+
    '           <li>I understand that I am free to withdraw at any time during the study and withdrawal will not affect my relationship with any of the named organisations and/or research team members; </li>'+
    '           <li>I provide my consent for the information collected about me to be used for the purpose of this research study only and accesed by researchers: Prof. Thomas Hills, Jan Antkiewicz, Diya Malhotra;</li>'+
    '           <li>I understand the purposes, study tasks and risks of the research described in the study;</li>'+
    '			<p align="center">' +
    '           <input type="button" id="consentButton" class="consent jspsych-btn" value="I agree" onclick="welcome.click.consent()" >' +
    '			</p>' +
    '		</div><br><br></div>';

welcome.section.demographics =
'	<!-- ####################### Demographics ####################### -->' +
'	<div class="demographics" style="display:none; align:center; width: 1000px">' +
'		<div class="demographics" style="text-align:left; border:0px solid; padding:10px;  width:800px; font-size:90%; float:right">' +
'			<!-- Explanatory text -->' +
'            <p font-size:110%><b>Demographic information:</b></p>' +
'			<p>We need this information for our records, but it is kept completely separate from'  +
'                information about your Amazon ID. As long as you finish the experiment you will get ' +
'                paid no matter what you put here, so please be honest.</p><br>' +
'			<!-- Gender -->' +
'			<label for="gender"><b>*Gender: &nbsp;</b></label>  ' +
'           <select name="gender" id="gender" class="drop-menu">' +
'<option>Male</option><option>Female</option><option>Non-binary</option><option>Not listed here</option><option>Prefer not to say</option></select>' +
'		<br><br>' +
'			<!-- Age -->' +
'           <label for="age"><b>*Age: &nbsp;</b></label><input type = "number" min="18" max="100" onKeyUp="if(this.value>100){this.value=\'100\';}else if(this.value<18){this.value=\'18\';}" id="age" name="age" /><br /><br />' +
'			<!-- Country -->' +
'			<label for="country"><b>*Country you live in: &nbsp;</b></label>  ' +
'           <select name="country" id="country" class="drop-menu">' +
'<option>Afghanistan</option><option>&Aring;land Islands</option><option>Albania</option><option>Algeria</option><option>American Samoa</option><option>Andorra</option><option>Angola</option><option>Anguilla</option><option>Antarctica</option><option>Antigua and Barbuda</option><option>Argentina</option><option>Armenia</option><option>Aruba</option><option>Australia</option><option>Austria</option><option>Azerbaijan</option><option>Bahamas</option><option>Bahrain</option><option>Bangladesh</option><option>Barbados</option><option>Belarus</option><option>Belgium</option><option>Belize</option><option>Benin</option><option>Bermuda</option><option>Bhutan</option><option>Bolivia</option><option>Bosnia and Herzegovina</option><option>Botswana</option><option>Bouvet Island</option><option>Brazil</option><option>British Indian Ocean territory</option><option>Brunei Darussalam</option><option>Bulgaria</option><option>Burkina Faso</option><option>Burundi</option><option>Cambodia</option><option>Cameroon</option><option>Canada</option><option>Cape Verde</option><option>Cayman Islands</option><option>Central African Republic</option><option>Chad</option><option>Chile</option><option>China</option><option>Christmas Island</option><option>Cocos (Keeling) Islands</option><option>Colombia</option><option>Comoros</option><option>Congo</option><option>Congo, Democratic Republic</option><option>Cook Islands</option><option>Costa Rica</option><option>C&ocirc;te d&#8217;Ivoire (Ivory Coast)</option><option>Croatia (Hrvatska)</option><option>Cuba</option><option>Cyprus</option><option>Czech Republic</option><option>Denmark</option><option>Djibouti</option><option>Dominica</option><option>Dominican Republic</option><option>East Timor</option><option>Ecuador</option><option>Egypt</option><option>El Salvador</option><option>Equatorial Guinea</option><option>Eritrea</option><option>Estonia</option><option>Ethiopia</option><option>Falkland Islands</option><option>Faroe Islands</option><option>Fiji</option><option>Finland</option><option>France</option><option>French Guiana</option><option>French Polynesia</option><option>French Southern Territories</option><option>Gabon</option><option>Gambia</option><option>Georgia</option><option>Germany</option><option>Ghana</option><option>Gibraltar</option><option>Greece</option><option>Greenland</option><option>Grenada</option><option>Guadeloupe</option><option>Guam</option><option>Guatemala</option><option>Guinea</option><option>Guinea-Bissau</option><option>Guyana</option><option>Haiti</option><option>Heard and McDonald Islands</option><option>Honduras</option><option>Hong Kong</option><option>Hungary</option><option>Iceland</option><option>India</option><option>Indonesia</option><option>Iran</option><option>Iraq</option><option>Ireland</option><option>Israel</option><option>Italy</option><option>Jamaica</option><option>Japan</option><option>Jordan</option><option>Kazakhstan</option><option>Kenya</option><option>Kiribati</option><option>Korea (north)</option><option>Korea (south)</option><option>Kuwait</option><option>Kyrgyzstan</option><option>Lao People&#8217;s Democratic Republic</option><option>Latvia</option><option>Lebanon</option><option>Lesotho</option><option>Liberia</option><option>Libyan Arab Jamahiriya</option><option>Liechtenstein</option><option>Lithuania</option><option>Luxembourg</option><option>Macao</option><option>Macedonia, North</option><option>Madagascar</option><option>Malawi</option><option>Malaysia</option><option>Maldives</option><option>Mali</option><option>Malta</option><option>Marshall Islands</option><option>Martinique</option><option>Mauritania</option><option>Mauritius</option><option>Mayotte</option><option>Mexico</option><option>Micronesia</option><option>Moldova</option><option>Monaco</option><option>Mongolia</option><option>Montenegro</option><option>Montserrat</option><option>Morocco</option><option>Mozambique</option><option>Myanmar</option><option>Namibia</option><option>Nauru</option><option>Nepal</option><option>Netherlands</option><option>Netherlands Antilles</option><option>New Caledonia</option><option>New Zealand</option><option>Nicaragua</option><option>Niger</option><option>Nigeria</option><option>Niue</option><option>Norfolk Island</option><option>Northern Mariana Islands</option><option>Norway</option><option>Oman</option><option>Pakistan</option><option>Palau</option><option>Palestinian Territories</option><option>Panama</option><option>Papua New Guinea</option><option>Paraguay</option><option>Peru</option><option>Philippines</option><option>Pitcairn</option><option>Poland</option><option>Portugal</option><option>Puerto Rico</option><option>Qatar</option><option>R&eacute;union</option><option>Romania</option><option>Russian Federation</option><option>Rwanda</option><option>Saint Helena</option><option>Saint Kitts and Nevis</option><option>Saint Lucia</option><option>Saint Pierre and Miquelon</option><option>Saint Vincent and the Grenadines</option><option>Samoa</option><option>San Marino</option><option>Sao Tome and Principe</option><option>Saudi Arabia</option><option>Senegal</option><option>Serbia</option><option>Seychelles</option><option>Sierra Leone</option><option>Singapore</option><option>Slovakia</option><option>Slovenia</option><option>Solomon Islands</option><option>Somalia</option><option>South Africa</option><option>South Georgia and the South Sandwich Islands</option><option>Spain</option><option>Sri Lanka</option><option>Sudan</option><option>Suriname</option><option>Svalbard and Jan Mayen Islands</option><option>Swaziland</option><option>Sweden</option><option>Switzerland</option><option>Syria</option><option>Taiwan</option><option>Tajikistan</option><option>Tanzania</option><option>Thailand</option><option>Togo</option><option>Tokelau</option><option>Tonga</option><option>Trinidad and Tobago</option><option>Tunisia</option><option>Turkey</option><option>Turkmenistan</option><option>Turks and Caicos Islands</option><option>Tuvalu</option><option>Uganda</option><option>Ukraine</option><option>United Arab Emirates</option><option>United Kingdom</option><option selected="selected">United States of America</option><option>Uruguay</option><option>Uzbekistan</option><option>Vanuatu</option><option>Vatican City</option><option>Venezuela</option><option>Vietnam</option><option>Virgin Islands (British)</option><option>Virgin Islands (US)</option><option>Wallis and Futuna Islands</option><option>Western Sahara</option><option>Yemen</option><option>Zaire</option><option>Zambia</option><option>Zimbabwe</option></select>' +
'		<br><br>' +
'           <!-- Email -->' +
'           <label for="email"><b>Email (OPTIONAL – this is only if you would like to be contacted about results of the study): &nbsp;</b></label><input id="email" name="email" /><br /><br />' +
'		<!-- Demographics  button -->' +
'        <p align="center">' +
'                <input type="button" class="demographics jspsych-btn"' +
'                        id="demographicsButton" value="Next >"' +
'                       onclick="welcome.click.demographics()">' +
'       </p></div>';


// ----------------------- helper functions ------------------

welcome.helpers = {};
welcome.helpers.getRadioButton = function(name) { // get the value of a radio button
    var i, radios = document.getElementsByName(name);
    for (i = 0; i < radios.length; i = i + 1) {
        if (radios[i].checked) {
            return (radios[i].value);
        }
    }
    return ("NA");
}
welcome.helpers.setDisplay = function(theClass, theValue) { // toggle display status
    var i, classElements = document.getElementsByClassName(theClass);
    for (i = 0; i < classElements.length; i = i + 1) {
        classElements[i].style.display = theValue;
    }
}
welcome.helpers.setVisibility = function(theClass, theValue) { // toggle visibility
    var i, classElements = document.getElementsByClassName(theClass);
    for (i = 0; i < classElements.length; i = i + 1) {
        classElements[i].style.visibility = theValue;
    }
}
welcome.helpers.setHeader = function(theValue) { // alter the header
    document.getElementById("header").innerText = theValue;
}
