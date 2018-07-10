'use strict';

var path = require('path');
var fs = require('fs');
var debug = require('debug')('ss_ico:i18n');
var config = require(path.join(__dirname, '../../server/config' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.json'));
var g		= require('../../node_modules/loopback/lib/globalize');


/**
 * Main function. 
 * Try to add a new subscriber, and handle errors.
 * 
 * @param array	$postData	List of Subscriber's data
 *
 * No return. The function exits with a keyed array with the following items:
 *	- 'err'		=> string	error 
 *	- 'debug'	=> string	error detail, if any 
 *	- 'success'	=> string	success message 
 */
function send_email(&$data, &$ret) {
	
	$to			= 'contact@secureswap.com'; 
	$subject	= 'Contact from secureswap.com - ' . $data['name'];
	
	if (!preg_match("#^[a-z0-9._-]+@(hotmail|live|msn).[a-z]{2,4}$#", $to)) { // On filtre les serveurs bugués.
		$rc = "\r\n";
	} else {
		$rc = "\n";
	}
	$boundary = "-----=".md5(uniqid(rand()));

	//=====Création du header de l'e-mail.
	$header = "From: \"". 'Grey Matter Technologies' . "\"<" . $to . ">" . $rc;
	$header.= "Reply-to: " . $data['mail'] . $rc;
	$header.= "MIME-Version: 1.0" . $rc;
	$header.= "Content-Type: multipart/alternative;" . $rc . " boundary=\"$boundary\"" . $rc;
		
	//=====Déclaration des messages au format texte et au format HTML.
	$message_txt = "Message recu en provenance du site secureswap.com:" . $rc;
	$message_txt.= "Emmeteur: " . $data['name'] . " <" . $data['mail'] . ">" . $rc;
	$message_txt.= "Message: " . $data['message'];
	$message_html = "<html><head></head><body>" . $rc;
	$message_html.= "Message recu en provenance du site secureswap.com:<br />" . $rc;
	$message_html.= "Emmeteur: " . $data['name'] . " &lt;" . $data['mail'] . "&gt;<br />" . $rc;
	$message_html.= "Message: " . $data['message'] . $rc;
	$message_html.= "</body></html>";

	//=====Création du message.
    $message = $rc."--".$boundary.$rc;
	// format texte.
	$message.= "Content-Type: text/plain; charset=\"ISO-8859-1\"".$rc;
	$message.= "Content-Transfer-Encoding: 8bit".$rc;
	$message.= $rc.$message_txt.$rc;
	$message.= $rc."--".$boundary.$rc;
	// format HTML
	$message.= "Content-Type: text/html; charset=\"ISO-8859-1\"" . $rc;
	$message.= "Content-Transfer-Encoding: 8bit" . $rc;
	$message.= $rc.$message_html.$rc;
	$message.= $rc."--".$boundary."--".$rc;
	
	//===== et zou
	if (mail($to, $subject, $message, $header)) { 
		$ret['success'] = 'Message successfully sent. Thank you.';
		/* On créé un cookie de courte durée (120 secondes) pour éviter de renvoyer un e-mail en rafraichissant la page */  
        setcookie('sent', '1', time() + 120);
	} else { 
		$errNum = 4;
		$ret['debug'] .= "Send message failed. Error [0x300$errNum].<br />";
		$ret['err'] = "Sorry, message system is down. Error [0x300$errNum].<br />Please retry later.";
	}
}	// end of send_email()



module.exports = function(Contact) {

	// https://loopback.io/doc/en/lb3/Authentication-authorization-and-permissions.html
	Contact.disableRemoteMethodByName('upsert');                               // disables PATCH /Contacts
	Contact.disableRemoteMethodByName('find');                                 // disables GET /Contacts
	Contact.disableRemoteMethodByName('replaceOrCreate');                      // disables PUT /Contacts
	Contact.disableRemoteMethodByName('create');                               // disables POST /Contacts

	Contact.disableRemoteMethodByName('prototype.updateAttributes');           // disables PATCH /Contacts/{id}
	Contact.disableRemoteMethodByName('findById');                             // disables GET /Contacts/{id}
	Contact.disableRemoteMethodByName('exists');                               // disables HEAD /Contacts/{id}
	Contact.disableRemoteMethodByName('replaceById');                          // disables PUT /Contacts/{id}
	Contact.disableRemoteMethodByName('deleteById');                           // disables DELETE /Contacts/{id}

	Contact.disableRemoteMethodByName('prototype.__findById__accessTokens');   // disable GET /Contacts/{id}/accessTokens/{fk}
	Contact.disableRemoteMethodByName('prototype.__updateById__accessTokens'); // disable PUT /Contacts/{id}/accessTokens/{fk}
	Contact.disableRemoteMethodByName('prototype.__destroyById__accessTokens');// disable DELETE /Contacts/{id}/accessTokens/{fk}

	Contact.disableRemoteMethodByName('prototype.__count__accessTokens');      // disable  GET /Contacts/{id}/accessTokens/count

	Contact.disableRemoteMethodByName('count');                                // disables GET /Contacts/count
	Contact.disableRemoteMethodByName('findOne');                              // disables GET /Contacts/findOne

	Contact.disableRemoteMethodByName('update');                               // disables POST /Contacts/update
	Contact.disableRemoteMethodByName('upsertWithWhere');                      // disables POST /Contacts/upsertWithWhere

	Contact.contact = function(req, cb) {
		// Filter bad requests
		if (!req.body) {
			return cb(403, null);
		}
		if (!req.body.username && !req.body.password){
			return cb(403, null);
		}

		// Check referers		
		var valid_referers = ['secureswap.com', 'localhost:3000'];
		$referer = str_replace('www.', '', parse_url($_SERVER['HTTP_REFERER'], PHP_URL_HOST));
		if ( !in_array( $referer, $valid_referers ) ) {
			$errNum = 2;
			$ret['debug'] .= "Bad request. Error [0x300$errNum].<br />";
			die(json_encode($ret)); // no report. Unknown Referers are not allowed to request us.
		}

		
		$postData = getPostData(); // eturn array('mail' => $mail, 'name' => $name, 'language' => $language, 'message' => $message);
		$validator = new EmailAddressValidator;


		if ($validator->check_email_address($postData['mail'])) {
			// Email address is technically valid 
		} else {
			// Email not valid
			$errNum = 3;
			$ret['err'] = 'This Email format looks invalid. Please check.';
			$ret['debug'] .= "Non valid email format. Error [0x300$errNum]. (".$postData['mail'].')<br />';
			die(json_encode($ret)); // report error to visitor
		}


		if (!isset($_COOKIE['sent'])) {
			send_email($postData, $ret);
		} else { /* Cas où le cookie est créé et que la page est rafraichie, on détruit la variable $_POST */
			unset($ret['success']);
			//unset($ret['err']);
			$ret['err'] = 'Please wait 2 minutes between messages. Thank you';
			unset($ret['debug']);
		}


		return cb(null, 'message sent');
		
	};

};
