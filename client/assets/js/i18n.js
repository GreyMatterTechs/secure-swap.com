/**
 * I18n.js
 * App for SecureSwap ICO website.
 * 
 * Includes all of the following: Tools.js
 * 
 * @version:	1.0.0
 * @author:		Philippe Aubessard, philippe@aubessard.net
 * @url         http://secure-swap.com
 * @license:	Copyright (c) 2018, GreyMattersTechs. All rights reserved.
 * @namespace:	ssw
 */
'use strict';

(function(window, undefined) {

	window.ssw = window.ssw || {};	// NameSpace

	if (window.ssw.Tools === undefined) { throw new Error('Please load Tools.js'); }

	// ---------- class I18n

	// --- public static

	// constructeur public static
	window.ssw.I18n = function() {
		throw new Error('Please use getInstance');
	};

	// singleton factory public static
	window.ssw.I18n.getInstance = function() {
		if (instance) { return instance; }
		instance = new I18n();
		return instance;
	};

	// --- private static

	// membres private static
	
	let instance = null;

	// Constructeur private static
	const I18n = function() {

		// --- private members


		// https://github.com/wikimedia/jquery.i18n
		// https://phraseapp.com/blog/posts/jquery-i18n-the-advanced-guide/
		// https://github.com/wikimedia/jquery.i18n

		// http://www.science.co.il/language/Locale-codes.php
		// http://www.metamodpro.com/browser-language-codes
		// http://www.science.co.il/language/Locale-codes.php
		// https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
		// http://4umi.com/web/html/languagecodes.php
		// https://gist.github.com/wpsmith/7604842

		// * \xE2\x80\x8E is the left-to-right marker and
		// * \xE2\x80\x8F is the right-to-left marker.
		// * They are required for ensuring the correct display of brackets in mixed rtl/ltr environment.

		const locales = [
			{browser: 'aa',			mailchimp: '',		flag: '',	native: 'Afaraf',					english: 'Afar',	 					notes: ''},
			{browser: 'ab',			mailchimp: '',		flag: '',	native: 'Аҧсуа',					english: 'Abkhazian',	 					notes: ''},
			{browser: 'ace',		mailchimp: '',		flag: '',	native: 'Acèh',						english: 'Aceh',	 					notes: ''},
			{browser: 'af',			mailchimp: 'af',	flag: '',	native: 'Afrikaans',				english: 'Afrikaans',					notes: ''},
			{browser: 'ak',			mailchimp: '',		flag: '',	native: 'Akan',						english: 'Akan',	 					notes: ''},
			{browser: 'aln',		mailchimp: '',		flag: '',	native: 'Gegë',						english: 'Gheg Albanian',				notes: ''},
			{browser: 'als',		mailchimp: '',		flag: '',	native: 'Alemannisch',				english: 'Alemannic',					notes: 'Not a valid code, for compatibility. See gsw.'},
			{browser: 'am',			mailchimp: '',		flag: '',	native: 'አማርኛ',						english: 'Amharic',						notes: ''},
			{browser: 'an',			mailchimp: '',		flag: '',	native: 'aragonés',					english: 'Aragonese',					notes: ''},
			{browser: 'ang',		mailchimp: '',		flag: '',	native: 'Ænglisc',					english: 'Old English',					notes: ''},
			{browser: 'anp',		mailchimp: '',		flag: '',	native: 'अङ्गिका',						english: 'Angika',						notes: ''},
			{browser: 'ar',			mailchimp: 'ar',	flag: '',	native: 'العربية',					english: 'Arabic',						notes: ''},
			{browser: 'ar-dz',		mailchimp: 'ar',	flag: '',	native: '',							english: 'Arabic (Algeria)',			notes: ''},
			{browser: 'ar-bh',		mailchimp: 'ar',	flag: '',	native: '',							english: 'Arabic (Bahrain)',			notes: ''},
			{browser: 'ar-eg',		mailchimp: 'ar',	flag: '',	native: 'مصرى',						english: 'Arabic (Egypt)',				notes: ''},
			{browser: 'ar-iq',		mailchimp: 'ar',	flag: '',	native: '',							english: 'Arabic (Iraq)',				notes: ''},
			{browser: 'ar-jo',		mailchimp: 'ar',	flag: '',	native: '',							english: 'Arabic (Jordan)',				notes: ''},
			{browser: 'ar-kw',		mailchimp: 'ar',	flag: '',	native: '',							english: 'Arabic (Kuwait)',				notes: ''},
			{browser: 'ar-lb',		mailchimp: 'ar',	flag: '',	native: '',							english: 'Arabic (Lebanon)',			notes: ''},
			{browser: 'ar-ly',		mailchimp: 'ar',	flag: '',	native: '',							english: 'Arabic (Libya)',				notes: ''},
			{browser: 'ar-ma',		mailchimp: 'ar',	flag: '',	native: 'Maġribi',					english: 'Arabic (Morocco)',			notes: ''},
			{browser: 'ar-om',		mailchimp: 'ar',	flag: '',	native: '',							english: 'Arabic (Oman)',				notes: ''},
			{browser: 'ar-qa',		mailchimp: 'ar',	flag: '',	native: '',							english: 'Arabic (Qatar)',				notes: ''},
			{browser: 'ar-sa',		mailchimp: 'ar',	flag: '',	native: '',							english: 'Arabic (Saudi Arabia)',		notes: ''},
			{browser: 'ar-sy',		mailchimp: 'ar',	flag: '',	native: '',							english: 'Arabic (Syria)',				notes: ''},
			{browser: 'ar-tn',		mailchimp: 'ar',	flag: '',	native: '',							english: 'Arabic (Tunisia)',			notes: ''},
			{browser: 'ar-ae',		mailchimp: 'ar',	flag: '',	native: '',							english: 'Arabic (U.A.E.)',				notes: ''},
			{browser: 'ar-ye',		mailchimp: 'ar',	flag: '',	native: '',							english: 'Arabic (Yemen)',				notes: ''},
			{browser: 'arc',		mailchimp: '',		flag: '',	native: 'ܐܪܡܝܐ',						english: 'Aramaic',						notes: ''},
			{browser: 'arn',		mailchimp: '',		flag: '',	native: 'mapudungun',				english: 'Mapuche, Mapudungu, Araucanian (Araucano)',				notes: ''},
			{browser: 'as',			mailchimp: '',		flag: '',	native: 'অসমীয়া',						english: 'Assamese',					notes: ''},
			{browser: 'ast',		mailchimp: '',		flag: '',	native: 'asturianu',				english: 'Asturian',					notes: ''},
			{browser: 'av',			mailchimp: '',		flag: '',	native: 'авар мацӀ',				english: 'Avaric',						notes: ''},
			{browser: 'avk',		mailchimp: '',		flag: '',	native: 'Kotava',					english: 'Kotava',						notes: ''},
			{browser: 'ay',			mailchimp: '',		flag: '',	native: 'Aymar aru',				english: 'Aymara',						notes: ''},
			{browser: 'az',			mailchimp: '',		flag: '',	native: 'Azərbaycan dili',			english: 'Azerbaijani',					notes: ''},
			{browser: 'azb',		mailchimp: '',		flag: '',	native: 'تورکجه',					english: 'South Azerbaijani',			notes: ''},
			{browser: 'ba',			mailchimp: '',		flag: '',	native: 'башҡортса',				english: 'Bashkir',						notes: ''},
			{browser: 'bar',		mailchimp: '',		flag: '',	native: 'Boarisch',					english: 'Bavarian (Austro-Bavarian and South Tyrolean)',				notes: ''},
			{browser: 'bat-smg',	mailchimp: '',		flag: '',	native: 'žemaitėška',				english: 'Samogitian',					notes: '(deprecated code, \'sgs\' in ISO 693-3 since 2010-06-30 )'},
			{browser: 'bbc',		mailchimp: '',		flag: '',	native: 'Batak Toba',				english: 'Batak Toba',					notes: ' (falls back to bbc-latn)'},
			{browser: 'bbc-latn',	mailchimp: '',		flag: '',	native: 'Batak Toba',				english: 'Batak Toba',					notes: ''},
			{browser: 'bcc',		mailchimp: '',		flag: '',	native: 'بلوچی مکرانی',				english: 'Southern Balochi',			notes: ''},
			{browser: 'bcl',		mailchimp: '',		flag: '',	native: 'Bikol Central',			english: 'Bikol: Central Bicolano language',				notes: ''},
			{browser: 'be',			mailchimp: 'be',	flag: 'be',	native: 'беларуская',				english: ' Belarusian normative',		notes: ''},
		//	{browser: 'be-tarask',	mailchimp: '',		flag: '',	native: '"беларуская (тарашкевіца)\xE2\x80\x8E"',	english: 'Belarusian in Taraskievica orthography',				notes: ''},
		//	{browser: 'be-x-old',	mailchimp: '',		flag: '',	native: '"беларуская (тарашкевіца)\xE2\x80\x8E"',	english: '(be-tarask compat)',				notes: ''},
			{browser: 'bg',			mailchimp: 'bg',	flag: 'bg',	native: 'български',				english: 'Bulgarian',					notes: ''},
			{browser: 'bh',			mailchimp: '',		flag: '',	native: 'भोजपुरी',						english: 'Bihari',						notes: 'macro language. Falls back to Bhojpuri (bho)'},
			{browser: 'bho',		mailchimp: '',		flag: '',	native: 'भोजपुरी',						english: 'Bhojpuri',					notes: ''},
			{browser: 'bi',			mailchimp: '',		flag: '',	native: 'Bislama',					english: 'Bislama',						notes: ''},
			{browser: 'bjn',		mailchimp: '',		flag: '',	native: 'Bahasa Banjar',			english: 'Banjarese',					notes: ''},
			{browser: 'bm',			mailchimp: '',		flag: '',	native: 'bamanankan',				english: 'Bambara',						notes: ''},
			{browser: 'bn',			mailchimp: '',		flag: 'bn',	native: 'বাংলা',						english: 'Bengali',						notes: ''},
			{browser: 'bo',			mailchimp: '',		flag: '',	native: 'བོད་ཡིག',							english: 'Tibetan',						notes: ''},
			{browser: 'bpy',		mailchimp: '',		flag: '',	native: 'বিষ্ণুপ্রিয়া মণিপুরী',					english: 'Bishnupriya Manipuri',		notes: ''},
			{browser: 'bqi',		mailchimp: '',		flag: '',	native: 'بختياري',					english: 'Bakthiari',					notes: ''},
			{browser: 'br',			mailchimp: '',		flag: '',	native: 'brezhoneg',				english: 'Breton',						notes: ''},
			{browser: 'brh',		mailchimp: '',		flag: '',	native: 'Bráhuí',					english: 'Brahui',						notes: ''},
			{browser: 'bs',			mailchimp: '',		flag: '',	native: 'bosanski',					english: 'Bosnian',						notes: ''},
			{browser: 'bug',		mailchimp: '',		flag: '',	native: 'ᨅᨔ ᨕᨘᨁᨗ',						english: 'Buginese',					notes: ''},
			{browser: 'bxr',		mailchimp: '',		flag: '',	native: 'буряад',					english: 'Buryat (Russia)',				notes: ''},
			{browser: 'ca',			mailchimp: 'ca',	flag: '',	native: 'català',					english: 'Catalan',						notes: ''},
			{browser: 'cbk-zam',	mailchimp: '',		flag: '',	native: 'Chavacano de Zamboanga',	english: 'Zamboanga Chavacano',			notes: ''},
			{browser: 'cdo',		mailchimp: '',		flag: '',	native: 'Mìng-dĕ̤ng-ngṳ̄',			english: 'Min Dong',					notes: ''},
			{browser: 'ce',			mailchimp: '',		flag: '',	native: 'нохчийн',					english: 'Chechen',						notes: ''},
			{browser: 'ceb',		mailchimp: '',		flag: '',	native: 'Cebuano',					english: 'Cebuano',						notes: ''},
			{browser: 'ch',			mailchimp: '',		flag: '',	native: 'Chamoru',					english: 'Chamorro',					notes: ''},
			{browser: 'cho',		mailchimp: '',		flag: '',	native: 'Choctaw',					english: 'Choctaw',						notes: ''},
			{browser: 'chr',		mailchimp: '',		flag: '',	native: 'ᏣᎳᎩ',						english: 'Cherokee',					notes: ''},
			{browser: 'chy',		mailchimp: '',		flag: '',	native: 'Tsetsêhestâhese',			english: 'Cheyenne',					notes: ''},
			{browser: 'ckb',		mailchimp: '',		flag: '',	native: 'کوردی',					english: 'Sorani',						notes: 'The name actually says "Kurdi" (Kurdish).'},
			{browser: 'co',			mailchimp: '',		flag: '',	native: 'corsu',					english: 'Corsican',					notes: ''},
			{browser: 'cps',		mailchimp: '',		flag: '',	native: 'Capiceño',					english: 'Capiznon',					notes: ''},
			{browser: 'cr',			mailchimp: '',		flag: '',	native: 'Nēhiyawēwin / ᓀᐦᐃᔭᐍᐏᐣ',		english: 'Cree',						notes: ''},
			{browser: 'crh',		mailchimp: '',		flag: '',	native: 'qırımtatarca',				english: 'Crimean Tatar',				notes: ' (multiple scripts - defaults to Latin)'},
			{browser: 'crh-latn',	mailchimp: '',		flag: '',	native: '"qırımtatarca (Latin)\xE2\x80\x8E"',	english: 'Crimean Tatar (Latin)',		notes: ''},
			{browser: 'crh-cyrl',	mailchimp: '',		flag: '',	native: '"къырымтатарджа (Кирилл)\xE2\x80\x8E"',english: 'Crimean Tatar (Cyrillic)',	notes: ''},
			{browser: 'cs',			mailchimp: 'cs',	flag: '',	native: 'čeština',					english: 'Czech',						notes: ''},
			{browser: 'csb',		mailchimp: '',		flag: '',	native: 'kaszëbsczi',				english: 'Cassubian',					notes: ''},
			{browser: 'cu',			mailchimp: '',		flag: '',	native: 'словѣньскъ / ⰔⰎⰑⰂⰡⰐⰠⰔⰍⰟ',	english: 'Old Church Slavonic (ancient language)',	notes: ''},
			{browser: 'cv',			mailchimp: '',		flag: '',	native: 'Чӑвашла',					english: 'Chuvash',						notes: ''},
			{browser: 'cy',			mailchimp: '',		flag: '',	native: 'Cymraeg',					english: 'Welsh',						notes: ''},
			{browser: 'da',			mailchimp: 'da',	flag: '',	native: 'Dansk',					english: 'Danish',						notes: ''},
			{browser: 'de',			mailchimp: 'de',	flag: 'de',	native: 'Deutsch',					english: 'German',						notes: ''},
			{browser: 'de-at',		mailchimp: 'de',	flag: 'de',	native: 'Österreichisches Deutsch',	english: 'German (Austria)',			notes: ''},
			{browser: 'de-ch',		mailchimp: 'de',	flag: 'ch',	native: 'Schweizer Hochdeutsch',	english: 'German (Switzerland)',		notes: ''},
			{browser: 'de-li',		mailchimp: 'de',	flag: 'li',	native: 'Liechtenstein Deutsch',	english: 'German (Liechtenstein)',		notes: ''},
			{browser: 'de-lu',		mailchimp: 'de',	flag: 'lu',	native: 'Luxembourg Deutsch',		english: 'German (Luxembourg)',			notes: ''},
			{browser: 'de-de',		mailchimp: 'de',	flag: 'de',	native: '"Deutsch (Sie-Form)\xE2\x80\x8E"',	english: 'German (Germany)',	notes: 'formal address ("Sie")'},
			{browser: 'diq',		mailchimp: '',		flag: '',	native: 'Zazaki',					english: 'Zazaki',						notes: ''},
			{browser: 'dsb',		mailchimp: '',		flag: '',	native: 'Dolnoserbski',				english: 'Lower Sorbian',				notes: ''},
			{browser: 'dtp',		mailchimp: '',		flag: '',	native: 'Dusun Bundu-liwan',		english: 'Central Dusun',				notes: ''},
			{browser: 'dv',			mailchimp: '',		flag: '',	native: 'ދިވެހިބަސް',						english: 'Dhivehi',						notes: ''},
			{browser: 'dz',			mailchimp: '',		flag: '',	native: 'ཇོང་ཁ',							english: 'Dzongkha (Bhutan)',			notes: ''},
			{browser: 'ee',			mailchimp: '',		flag: '',	native: 'Eʋegbe',					english: 'Éwé',							notes: ''},
			{browser: 'egl',		mailchimp: '',		flag: '',	native: 'Emiliàn',					english: 'Emilian',						notes: ''},
			{browser: 'el',			mailchimp: 'el',	flag: '',	native: 'Ελληνικά',					english: 'Greek',						notes: ''},
			{browser: 'eml',		mailchimp: '',		flag: '',	native: 'Emiliàn e rumagnòl',		english: 'Emiliano-Romagnolo / Sammarinese',		notes: ''},
			{browser: 'en',			mailchimp: 'en',	flag: 'gb',	native: 'English',					english: 'English',						notes: ''},
			{browser: 'en-au',		mailchimp: 'en',	flag: '',	native: 'Australian English',		english: 'English (Australia)',			notes: ''},
			{browser: 'en-bz',		mailchimp: 'en',	flag: '',	native: 'English',					english: 'English (Belize)',			notes: ''},
			{browser: 'en-ca',		mailchimp: 'en',	flag: '',	native: 'Canadian English',			english: 'English (Canada)',			notes: ''},
			{browser: 'en-ie',		mailchimp: 'en',	flag: '',	native: 'English',					english: 'English (Ireland)',			notes: ''},
			{browser: 'en-jm',		mailchimp: 'en',	flag: '',	native: 'English',					english: 'English (Jamaica)',			notes: ''},
			{browser: 'en-nz',		mailchimp: 'en',	flag: '',	native: 'English',					english: 'English (New Zealand)',		notes: ''},
			{browser: 'en-ph',		mailchimp: 'en',	flag: '',	native: 'English',					english: 'English (Philippines)',		notes: ''},
			{browser: 'en-za',		mailchimp: 'en',	flag: '',	native: 'English',					english: 'English (South Africa)',		notes: ''},
			{browser: 'en-tt',		mailchimp: 'en',	flag: '',	native: 'English',					english: 'English (Trinidad & Tobago)',	notes: ''},
			{browser: 'en-gb',		mailchimp: 'en',	flag: 'gb',	native: 'British English',			english: 'English (United Kingdom)',	notes: ''},
			{browser: 'en-us',		mailchimp: 'en',	flag: 'us',	native: 'American English',			english: 'English (United States)',		notes: ''},
			{browser: 'en-zw',		mailchimp: 'en',	flag: '',	native: 'Zimbabwe English',			english: 'English (Zimbabwe)',			notes: ''},
			{browser: 'eo',			mailchimp: '',		flag: '',	native: 'Esperanto',				english: 'Esperanto',					notes: ''},
			{browser: 'es',			mailchimp: 'es_ES',	flag: 'es',	native: 'Español',					english: 'Spanish',						notes: ''},
			{browser: 'es-ar',		mailchimp: 'es_ES',	flag: 'es',	native: '',							english: 'Spanish (Argentina)',			notes: ''},
			{browser: 'es-bo',		mailchimp: 'es_ES',	flag: 'es',	native: '',							english: 'Spanish (Bolivia)',			notes: ''},
			{browser: 'es-cl',		mailchimp: 'es_ES',	flag: 'es',	native: '',							english: 'Spanish (Chile)',				notes: ''},
			{browser: 'es-co',		mailchimp: 'es_ES',	flag: 'es',	native: '',							english: 'Spanish (Colombia)',			notes: ''},
			{browser: 'es-cr',		mailchimp: 'es_ES',	flag: 'es',	native: '',							english: 'Spanish (Costa Rica)',		notes: ''},
			{browser: 'es-do',		mailchimp: 'es_ES',	flag: 'es',	native: '',							english: 'Spanish (Dominican Republic)',notes: ''},
			{browser: 'es-ec',		mailchimp: 'es_ES',	flag: 'es',	native: '',							english: 'Spanish (Ecuador)',			notes: ''},
			{browser: 'es-sv',		mailchimp: 'es_ES',	flag: 'es',	native: '',							english: 'Spanish (El Salvador)',		notes: ''},
			{browser: 'es-gt',		mailchimp: 'es_ES',	flag: 'es',	native: '',							english: 'Spanish (Guatemala)',			notes: ''},
			{browser: 'es-hn',		mailchimp: 'es_ES',	flag: 'es',	native: '',							english: 'Spanish (Honduras)',			notes: ''},
			{browser: 'es-mx',		mailchimp: 'es',	flag: 'es',	native: '',							english: 'Spanish (Mexico)',			notes: ''},
			{browser: 'es-ni',		mailchimp: 'es_ES',	flag: 'es',	native: '',							english: 'Spanish (Nicaragua)',			notes: ''},
			{browser: 'es-pa',		mailchimp: 'es_ES',	flag: 'es',	native: '',							english: 'Spanish (Panama)',			notes: ''},
			{browser: 'es-py',		mailchimp: 'es_ES',	flag: 'es',	native: '',							english: 'Spanish (Paraguay)',			notes: ''},
			{browser: 'es-pe',		mailchimp: 'es_ES',	flag: 'es',	native: '',							english: 'Spanish (Peru)',				notes: ''},
			{browser: 'es-pr',		mailchimp: 'es_ES',	flag: 'es',	native: '',							english: 'Spanish (Puerto Rico)',		notes: ''},
			{browser: 'es-es',		mailchimp: 'es_ES',	flag: 'es',	native: '',							english: 'Spanish (Spain)',				notes: ''},
			{browser: 'es-uy',		mailchimp: 'es_ES',	flag: 'es',	native: '',							english: 'Spanish (Uruguay)',			notes: ''},
			{browser: 'es-ve',		mailchimp: 'es_ES',	flag: 'es',	native: '',							english: 'Spanish (Venezuela)',			notes: ''},
			{browser: 'et',			mailchimp: 'et',	flag: '',	native: 'Eesti',					english: 'Estonian',					notes: ''},
			{browser: 'eu',			mailchimp: '',		flag: '',	native: 'Euskara',					english: 'Basque',				notes: ''},
			{browser: 'ext',		mailchimp: '',		flag: '',	native: 'Estremeñu',				english: 'Extremaduran',				notes: ''},
			{browser: 'fa',			mailchimp: 'fa',	flag: '',	native: 'فارسی',					english: 'Persian/Farsi',				notes: ''},
			{browser: 'fa-ir',		mailchimp: 'fa',	flag: '',	native: '',							english: 'Persian/Iran',				notes: ''},
			{browser: 'ff',			mailchimp: '',		flag: '',	native: 'Fulfulde',					english: 'Fulfulde, Maasina',				notes: ''},
			{browser: 'fi',			mailchimp: 'fi',	flag: '',	native: 'Suomi',					english: 'Finnish',				notes: ''},
			{browser: 'fit',		mailchimp: '',		flag: '',	native: 'Meänkieli',				english: 'Tornedalen Finnish',				notes: ''},
			{browser: 'fiu-vro',	mailchimp: '',		flag: '',	native: 'Võro',						english: 'Võro',				notes: ' (deprecated code, \'vro\' in ISO 639-3 since 2009-01-16)'},
			{browser: 'fj',			mailchimp: '',		flag: '',	native: 'Na Vosa Vakaviti',			english: 'Fijian',				notes: ''},
			{browser: 'fo',			mailchimp: '',		flag: '',	native: 'Føroyskt',					english: 'Faroese',				notes: ''},
			{browser: 'fr',			mailchimp: 'fr',	flag: 'fr',	native: 'Français',					english: 'French',								notes: ''},
			{browser: 'fr-be',		mailchimp: 'fr',	flag: 'be',	native: 'Français (Belgique)',		english: 'French (Belgium)',					notes: ''},
			{browser: 'fr-ca',		mailchimp: 'fr_CA',	flag: 'ca',	native: 'Français (Canada)',		english: 'French (Canada)',						notes: ''},
			{browser: 'fr-fr',		mailchimp: 'fr',	flag: 'fr',	native: 'Français (France)',		english: 'French (France)',						notes: ''},
			{browser: 'fr-lu',		mailchimp: 'fr',	flag: 'lu',	native: 'Français (Luxembourg)',	english: 'French (Luxembourg)',					notes: ''},
			{browser: 'fr-mc',		mailchimp: 'fr',	flag: 'mc',	native: 'Français (Monaco)',		english: 'French (Monaco)',						notes: ''},
			{browser: 'fr-ch',		mailchimp: 'fr',	flag: 'ch',	native: 'Français (Suisse)',		english: 'French (Switzerland)',				notes: ''},
			{browser: 'frc',		mailchimp: '',		flag: '',	native: 'Français cadien',			english: 'Cajun French',				notes: ''},
			{browser: 'frp',		mailchimp: '',		flag: '',	native: 'Arpetan',					english: 'Franco-Provençal/Arpitan',				notes: ''},
			{browser: 'frr',		mailchimp: '',		flag: '',	native: 'Nordfriisk',				english: 'North Frisian',				notes: ''},
			{browser: 'fur',		mailchimp: '',		flag: '',	native: 'Furlan',					english: 'Friulian',				notes: ''},
			{browser: 'fy',			mailchimp: '',		flag: '',	native: 'Frysk',					english: 'Frisian',				notes: ''},
			{browser: 'ga',			mailchimp: 'ga',	flag: '',	native: 'Gaeilge',					english: 'Irish',				notes: ''},
			{browser: 'gag',		mailchimp: '',		flag: '',	native: 'Gagauz',					english: 'Gagauz',				notes: ''},
			{browser: 'gan',		mailchimp: '',		flag: '',	native: '贛語',						english: 'Gan',				notes: ' (multiple scripts - defaults to Traditional)'},
			{browser: 'gan-hans',	mailchimp: '',		flag: '',	native: '"赣语（简体）\xE2\x80\x8E"',	english: 'Gan (Simplified Han)',				notes: ''},
			{browser: 'gan-hant',	mailchimp: '',		flag: '',	native: '"贛語（繁體）\xE2\x80\x8E"',	english: 'Gan (Traditional Han)',				notes: ''},
			{browser: 'gd',			mailchimp: 'ga',	flag: '',	native: 'Gàidhlig',					english: 'Gaelic (Scots)',				notes: ''},
			{browser: 'gd-ie',		mailchimp: 'ga',	flag: '',	native: '',							english: 'Gaelic (Irish)',				notes: ''},
			{browser: 'gl',			mailchimp: '',		flag: '',	native: 'Galego',					english: 'Galician',				notes: ''},
			{browser: 'glk',		mailchimp: '',		flag: '',	native: 'گیلکی',					english: 'Gilaki',				notes: ''},
			{browser: 'gn',			mailchimp: '',		flag: '',	native: 'Avañe\'ẽ',					english: 'Guaraní, Paraguayan',				notes: ''},
			{browser: 'gom-latn',	mailchimp: '',		flag: '',	native: 'Konknni',					english: 'Goan Konkani',				notes: '(Latin script)'},
			{browser: 'got',		mailchimp: '',		flag: '',	native: '𐌲𐌿𐍄𐌹𐍃𐌺',						english: 'Gothic',				notes: ''},
			{browser: 'grc',		mailchimp: '',		flag: '',	native: 'Ἀρχαία ἑλληνικὴ',			english: 'Ancient Greek',				notes: ''},
			{browser: 'gsw',		mailchimp: '',		flag: '',	native: 'Alemannisch',				english: 'Alemannic',				notes: ''},
			{browser: 'gu',			mailchimp: '',		flag: '',	native: 'ગુજરાતી',						english: 'Gujarati',				notes: ''},
			{browser: 'gv',			mailchimp: '',		flag: '',	native: 'Gaelg',					english: 'Manx',				notes: ''},
			{browser: 'ha',			mailchimp: '',		flag: '',	native: 'Hausa',					english: 'Hausa',				notes: ''},
			{browser: 'hak',		mailchimp: '',		flag: '',	native: '客家語/Hak-kâ-ngî',			english: 'Hakka',				notes: ''},
			{browser: 'haw',		mailchimp: '',		flag: '',	native: 'Hawai`i',					english: 'Hawaiian',				notes: ''},
			{browser: 'he', 		mailchimp: 'he',	flag: '',	native: 'עברית',					english: 'Hebrew', 					notes: '' },
			{browser: 'he-il', 		mailchimp: 'he',	flag: 'il',	native: 'עברית',					english: 'Hebrew (Israel)',			notes: '' },
			{browser: 'hi',			mailchimp: 'hi',	flag: '',	native: 'हिन्दी',						english: 'Hindi',				notes: ''},
			{browser: 'hif',		mailchimp: '',		flag: '',	native: 'Fiji Hindi',				english: 'Fijian Hindi',				notes: ' (multiple scripts - defaults to Latin)'},
			{browser: 'hif-latn',	mailchimp: '',		flag: '',	native: 'Fiji Hindi',				english: 'Fiji Hindi',				notes: ' (latin)'},
			{browser: 'hil',		mailchimp: '',		flag: '',	native: 'Ilonggo',					english: 'Hiligaynon',				notes: ''},
			{browser: 'ho',			mailchimp: '',		flag: '',	native: 'Hiri Motu',				english: 'Hiri Motu',				notes: ''},
			{browser: 'hr',			mailchimp: 'hr',	flag: '',	native: 'hrvatski',					english: 'Croatian',				notes: ''},
			{browser: 'hsb',		mailchimp: '',		flag: '',	native: 'hornjoserbsce',			english: 'Upper Sorbian',				notes: ''},
			{browser: 'ht',			mailchimp: '',		flag: '',	native: 'Kreyòl ayisyen',			english: 'Haitian Creole French',				notes: ''},
			{browser: 'hu',			mailchimp: 'hu',	flag: '',	native: 'magyar',					english: 'Hungarian',				notes: ''},
			{browser: 'hy',			mailchimp: '',		flag: '',	native: 'Հայերեն',					english: 'Armenian',				notes: ''},
			{browser: 'hz',			mailchimp: '',		flag: '',	native: 'Otsiherero',				english: 'Herero',				notes: ''},
			{browser: 'ia',			mailchimp: '',		flag: '',	native: 'interlingua',				english: 'Interlingua (IALA)',				notes: ''},
			{browser: 'id',			mailchimp: 'id',	flag: 'id',	native: 'Bahasa Indonesia',			english: 'Indonesian',				notes: ''},
			{browser: 'id-id',		mailchimp: 'id',	flag: 'id', native: 'Bahasa Indonesia',			english: 'Indonesian',				notes: '' },
			{browser: 'ie',			mailchimp: '',		flag: '',	native: 'Interlingue',				english: 'Interlingue (Occidental)',				notes: ''},
			{browser: 'ig',			mailchimp: '',		flag: '',	native: 'Igbo',						english: 'Igbo',				notes: ''},
			{browser: 'ii',			mailchimp: '',		flag: '',	native: 'ꆇꉙ',						english: 'Sichuan Yi',				notes: ''},
			{browser: 'ik',			mailchimp: '',		flag: '',	native: 'Iñupiak',					english: 'Inupiak',				notes: '(Inupiatun, Northwest Alaska / Inupiatun, North Alaskan)'},
			{browser: 'ike-cans',	mailchimp: '',		flag: '',	native: 'ᐃᓄᒃᑎᑐᑦ',						english: 'Inuktitut, Eastern Canadian',				notes: '(Unified Canadian Aboriginal Syllabics)'},
			{browser: 'ike-latn',	mailchimp: '',		flag: '',	native: 'inuktitut',				english: 'Inuktitut, Eastern Canadian',				notes: '(Latin script)'},
			{browser: 'ilo',		mailchimp: '',		flag: '',	native: 'Ilokano',					english: 'Ilokano',				notes: ''},
			{browser: 'inh',		mailchimp: '',		flag: '',	native: 'ГӀалгӀай',					english: 'Ingush',				notes: ''},
			{browser: 'io',			mailchimp: '',		flag: '',	native: 'Ido',						english: 'Ido',				notes: ''},
			{browser: 'is',			mailchimp: 'is',	flag: '',	native: 'íslenska',					english: 'Icelandic',				notes: ''},
			{browser: 'it',			mailchimp: 'it',	flag: 'it',	native: 'italiano',					english: 'Italian',				notes: ''},
			{browser: 'it-ch',		mailchimp: 'it',	flag: '',	native: '',							english: 'Italian (Switzerland)',				notes: ''},
			{browser: 'iu',			mailchimp: '',		flag: '',	native: 'ᐃᓄᒃᑎᑐᑦ/inuktitut',			english: 'Inuktitut',				notes: '(macro language, see ike/ikt, falls back to ike-cans)'},
			{browser: 'ja',			mailchimp: 'ja',	flag: 'jp',	native: '日本語',						english: 'Japanese',				notes: ''},
			{browser: 'ja-jp',		mailchimp: 'ja', 	flag: 'jp',	native: '日本語(関西)', 			english: 'Japanese (Kansai)',			notes: ''},
			{browser: 'jam',		mailchimp: '',		flag: '',	native: 'Patois',					english: 'Jamaican Creole English',				notes: ''},
			{browser: 'jbo',		mailchimp: '',		flag: '',	native: 'Lojban',					english: 'Lojban',				notes: ''},
			{browser: 'jut',		mailchimp: '',		flag: '',	native: 'jysk',						english: 'Jutish / Jutlandic',				notes: ''},
			{browser: 'jv',			mailchimp: '',		flag: '',	native: 'Basa Jawa',				english: 'Javanese',				notes: ''},
			{browser: 'ji',			mailchimp: '',		flag: '',	native: '',							english: 'Yiddish',				notes: ''},
			{browser: 'ka',			mailchimp: '',		flag: '',	native: 'ქართული',					english: 'Georgian',				notes: ''},
			{browser: 'kaa',		mailchimp: '',		flag: '',	native: 'Qaraqalpaqsha',			english: 'Karakalpak',				notes: ''},
			{browser: 'kab',		mailchimp: '',		flag: '',	native: 'Taqbaylit',				english: 'Kabyle',				notes: ''},
			{browser: 'kbd',		mailchimp: '',		flag: '',	native: 'Адыгэбзэ',					english: 'Kabardian',				notes: ''},
			{browser: 'kbd-cyrl',	mailchimp: '',		flag: '',	native: 'Адыгэбзэ',					english: 'Kabardian (Cyrillic)',				notes: ''},
			{browser: 'kg',			mailchimp: '',		flag: '',	native: 'Kongo',					english: 'Kongo',				notes: '(FIXME!) should probaly be KiKongo or KiKoongo'},
			{browser: 'khw',		mailchimp: '',		flag: '',	native: 'کھوار',					english: 'Khowar',				notes: ''},
			{browser: 'ki',			mailchimp: '',		flag: '',	native: 'Gĩkũyũ',					english: 'Gikuyu',				notes: ''},
			{browser: 'kiu',		mailchimp: '',		flag: '',	native: 'Kırmancki',				english: 'Kirmanjki',				notes: ''},
			{browser: 'kj',			mailchimp: '',		flag: '',	native: 'Kwanyama',					english: 'Kwanyama',				notes: ''},
			{browser: 'kk',			mailchimp: '',		flag: '',	native: 'қазақша',					english: 'Kazakh',				notes: '(multiple scripts - defaults to Cyrillic)'},
			{browser: 'kk-arab',	mailchimp: '',		flag: '',	native: '"قازاقشا (تٴوتە)\xE2\x80\x8F"',		english: 'Kazakh Arabic',				notes: ''},
			{browser: 'kk-cyrl',	mailchimp: '',		flag: '',	native: '"қазақша (кирил)\xE2\x80\x8E"',	english: 'Kazakh Cyrillic',				notes: ''},
			{browser: 'kk-latn',	mailchimp: '',		flag: '',	native: '"qazaqşa (latın)\xE2\x80\x8E"',	english: 'Kazakh Latin',				notes: ''},
			{browser: 'kk-cn',		mailchimp: '',		flag: '',	native: '"قازاقشا (جۇنگو)\xE2\x80\x8F"',	english: 'Kazakh (China)',				notes: ''},
			{browser: 'kk-kz',		mailchimp: '',		flag: '',	native: '"қазақша (Қазақстан)\xE2\x80\x8E"',english: 'Kazakh (Kazakhstan)',				notes: ''},
			{browser: 'kk-tr',		mailchimp: '',		flag: '',	native: '"qazaqşa (Türkïya)\xE2\x80\x8E"',	english: 'Kazakh (Turkey)',				notes: ''},
			{browser: 'kl',			mailchimp: '',		flag: '',	native: 'kalaallisut',				english: 'Inuktitut, Greenlandic/Greenlandic/Kalaallisut (kal)',				notes: ''},
			{browser: 'km',			mailchimp: 'km',	flag: '',	native: 'ភាសាខ្មែរ',						english: 'Khmer, Central',				notes: ''},
			{browser: 'kn',			mailchimp: '',		flag: '',	native: 'ಕನ್ನಡ',						english: 'Kannada',				notes: ''},
			{browser: 'ko',			mailchimp: 'ko',	flag: '',	native: '한국어',						english: 'Korean',				notes: ''},
			{browser: 'ko-kp',		mailchimp: 'ko',	flag: '',	native: '한국어 (조선)',				english: 'Korean (North Korea)',				notes: ''},
			{browser: 'ko-kr',		mailchimp: 'ko',	flag: '',	native: '',							english: 'Korean (South Korea)',				notes: ''},
			{browser: 'koi',		mailchimp: '',		flag: '',	native: 'Перем Коми',				english: 'Komi-Permyak',				notes: ''},
			{browser: 'kr',			mailchimp: '',		flag: '',	native: 'Kanuri',					english: 'Kanuri, Central',				notes: ''},
			{browser: 'krc',		mailchimp: '',		flag: '',	native: 'къарачай-малкъар',			english: 'Karachay-Balkar',				notes: ''},
			{browser: 'kri',		mailchimp: '',		flag: '',	native: 'Krio',						english: 'Krio',				notes: ''},
			{browser: 'krj',		mailchimp: '',		flag: '',	native: 'Kinaray-a',				english: 'Kinaray-a',				notes: ''},
			{browser: 'ks',			mailchimp: '',		flag: '',	native: 'कॉशुर / کٲشُر',					english: 'Kashmiri',				notes: '(multiple scripts - defaults to Perso-Arabic)'},
			{browser: 'ks-arab',	mailchimp: '',		flag: '',	native: 'کٲشُر',						english: 'Kashmiri',				notes: '(Perso-Arabic script)'},
			{browser: 'ks-deva',	mailchimp: '',		flag: '',	native: 'कॉशुर',						english: 'Kashmiri',				notes: '(Devanagari script)'},
			{browser: 'ksh',		mailchimp: '',		flag: '',	native: 'Ripoarisch',				english: 'Ripuarian',				notes: ''},
			{browser: 'ku',			mailchimp: '',		flag: '',	native: 'Kurdî',					english: 'Kurdish',				notes: '(multiple scripts - defaults to Latin)'},
			{browser: 'ku-latn',	mailchimp: '',		flag: '',	native: '"Kurdî (latînî)\xE2\x80\x8E"',	english: 'Northern Kurdish',				notes: '(Latin script)'},
			{browser: 'ku-arab',	mailchimp: '',		flag: '',	native: '"كوردي (عەرەبی)\xE2\x80\x8F"',	english: 'Northern Kurdish',				notes: '(Arabic script) (falls back to ckb)'},
			{browser: 'kv',			mailchimp: '',		flag: '',	native: 'коми',						english: 'Komi-Zyrian',				notes: '(Cyrillic is common script but also written in Latin script)'},
			{browser: 'kw',			mailchimp: '',		flag: '',	native: 'kernowek',					english: 'Cornish',				notes: ''},
			{browser: 'ky',			mailchimp: '',		flag: '',	native: 'Кыргызча',					english: 'Kirghiz',				notes: ''},
			{browser: 'la',			mailchimp: '',		flag: '',	native: 'Latina',					english: 'Latin',				notes: ''},
			{browser: 'lad',		mailchimp: '',		flag: '',	native: 'Ladino',					english: 'Ladino',				notes: ''},
			{browser: 'lb',			mailchimp: '',		flag: '',	native: 'Lëtzebuergesch',			english: 'Luxemburguish',				notes: ''},
			{browser: 'lbe',		mailchimp: '',		flag: '',	native: 'лакку',					english: 'Lak',				notes: ''},
			{browser: 'lez',		mailchimp: '',		flag: '',	native: 'лезги',					english: 'Lezgi',				notes: ''},
			{browser: 'lfn',		mailchimp: '',		flag: '',	native: 'Lingua Franca Nova',		english: 'Lingua Franca Nova',				notes: ''},
			{browser: 'lg',			mailchimp: '',		flag: '',	native: 'Luganda',					english: 'Ganda',				notes: ''},
			{browser: 'li',			mailchimp: '',		flag: '',	native: 'Limburgs',					english: 'Limburgian',				notes: ''},
			{browser: 'lij',		mailchimp: '',		flag: '',	native: 'Ligure',					english: 'Ligurian',				notes: ''},
			{browser: 'liv',		mailchimp: '',		flag: '',	native: 'Līvõ kēļ',					english: 'Livonian',				notes: ''},
			{browser: 'lmo',		mailchimp: '',		flag: '',	native: 'lumbaart',					english: 'Lombard',				notes: ''},
			{browser: 'ln',			mailchimp: '',		flag: '',	native: 'lingála',					english: 'Lingala',				notes: ''},
			{browser: 'lo',			mailchimp: '',		flag: '',	native: 'ລາວ',						english: 'Laotian',				notes: ''},
			{browser: 'lrc',		mailchimp: '',		flag: '',	native: 'لوری',						english: 'Northern Luri',				notes: ''},
			{browser: 'loz',		mailchimp: '',		flag: '',	native: 'Silozi',					english: 'Lozi',				notes: ''},
			{browser: 'lt',			mailchimp: 'lt',	flag: '',	native: 'lietuvių',					english: 'Lithuanian',				notes: ''},
			{browser: 'ltg',		mailchimp: '',		flag: '',	native: 'latgaļu',					english: 'Latgalian',				notes: ''},
			{browser: 'lus',		mailchimp: '',		flag: '',	native: 'Mizo ţawng',				english: 'Mizo/Lushai',				notes: ''},
			{browser: 'lv',			mailchimp: 'lv',	flag: '',	native: 'latviešu',					english: 'Latvian',				notes: ''},
			{browser: 'lzh',		mailchimp: '',		flag: '',	native: '文言',						english: 'Literary Chinese',				notes: ''},
			{browser: 'lzz',		mailchimp: '',		flag: '',	native: 'Lazuri',					english: 'Laz',				notes: ''},
			{browser: 'mai',		mailchimp: '',		flag: '',	native: 'मैथिली',						english: 'Maithili',				notes: ''},
			{browser: 'map-bms',	mailchimp: '',		flag: '',	native: 'Basa Banyumasan',			english: 'Banyumasan',				notes: ''},
			{browser: 'mdf',		mailchimp: '',		flag: '',	native: 'мокшень',					english: 'Moksha',				notes: ''},
			{browser: 'mg',			mailchimp: '',		flag: '',	native: 'Malagasy',					english: 'Malagasy',				notes: ''},
			{browser: 'mh',			mailchimp: '',		flag: '',	native: 'Ebon',						english: 'Marshallese',				notes: ''},
			{browser: 'mhr',		mailchimp: '',		flag: '',	native: 'олык марий',				english: 'Eastern Mari',				notes: ''},
			{browser: 'mi',			mailchimp: '',		flag: '',	native: 'Māori',					english: 'Maori',				notes: ''},
			{browser: 'min',		mailchimp: '',		flag: '',	native: 'Baso Minangkabau',			english: 'Minangkabau',				notes: ''},
			{browser: 'mk',			mailchimp: 'mk',	flag: '',	native: 'македонски',				english: 'Macedonian',				notes: ''},
			{browser: 'ml',			mailchimp: '',		flag: '',	native: 'മലയാളം',						english: 'Malayalam',				notes: ''},
			{browser: 'mn',			mailchimp: '',		flag: '',	native: 'монгол',					english: 'Halh Mongolian (Cyrillic)',				notes: '(ISO 639-3: khk)'},
			{browser: 'mo',			mailchimp: '',		flag: '',	native: 'молдовеняскэ',				english: 'Moldovan',				notes: 'deprecated'},
			{browser: 'mr',			mailchimp: '',		flag: '',	native: 'मराठी',						english: 'Marathi',				notes: ''},
			{browser: 'mrj',		mailchimp: '',		flag: '',	native: 'кырык мары',				english: 'Hill Mari',				notes: ''},
			{browser: 'ms',			mailchimp: 'ms',	flag: '',	native: 'Bahasa Melayu',			english: 'Malay',				notes: ''},
			{browser: 'mt',			mailchimp: 'mt',	flag: '',	native: 'Malti',					english: 'Maltese',				notes: ''},
			{browser: 'mus',		mailchimp: '',		flag: '',	native: 'Mvskoke',					english: 'Muskogee/Creek',				notes: ''},
			{browser: 'mwl',		mailchimp: '',		flag: '',	native: 'Mirandés',					english: 'Mirandese',				notes: ''},
			{browser: 'my',			mailchimp: '',		flag: '',	native: 'မြန်မာဘာသာ',					english: 'Burmese',				notes: ''},
			{browser: 'myv',		mailchimp: '',		flag: '',	native: 'эрзянь',					english: 'Erzya',				notes: ''},
			{browser: 'mzn',		mailchimp: '',		flag: '',	native: 'مازِرونی',					english: 'Mazanderani',				notes: ''},
			{browser: 'na',			mailchimp: '',		flag: '',	native: 'Dorerin Naoero',			english: 'Nauruan',				notes: ''},
			{browser: 'nah',		mailchimp: '',		flag: '',	native: 'Nāhuatl',					english: 'Nahuatl',				notes: '(not in ISO 639-3)'},
			{browser: 'nan',		mailchimp: '',		flag: '',	native: 'Bân-lâm-gú',				english: 'Min-nan',				notes: ''},
			{browser: 'nap',		mailchimp: '',		flag: '',	native: 'Napulitano',				english: 'Neapolitan',				notes: ''},
			{browser: 'nb',			mailchimp: '',		flag: '',	native: '"norsk bokmål',			english: 'Norwegian (Bokmal)',				notes: ''},
			{browser: 'nds',		mailchimp: '',		flag: '',	native: 'Plattdüütsch',				english: 'Low German',				notes: 'or Low Saxon'},
			{browser: 'nds-nl',		mailchimp: '',		flag: '',	native: 'Nedersaksies',				english: 'Nedersaksisch',				notes: 'Dutch Low Saxon'},
			{browser: 'ne',			mailchimp: '',		flag: '',	native: 'नेपाली',						english: 'Nepali',				notes: ''},
			{browser: 'new',		mailchimp: '',		flag: '',	native: 'नेपाल भाषा',						english: 'Newar / Nepal Bhasha',				notes: ''},
			{browser: 'ng',			mailchimp: '',		flag: '',	native: 'Oshiwambo',				english: 'Ndonga',				notes: ''},
			{browser: 'niu',		mailchimp: '',		flag: '',	native: 'Niuē',						english: 'Niuean',				notes: ''},
			{browser: 'nl',			mailchimp: 'nl',	flag: '',	native: 'Nederlands',				english: 'Dutch',				notes: ''},
		//	{browser: 'nl-informal',mailchimp: 'nl',	flag: '',	native: '"Nederlands (informeel)\xE2\x80\x8E"',	english: 'Dutch',				notes: 'informal address ("je")'},
			{browser: 'nl-be',		mailchimp: 'nl',	flag: '',	native: '',							english: 'Dutch (Belgian)',				notes: ''},
			{browser: 'no',			mailchimp: 'no',	flag: '',	native: '"Norsk"',					english: 'Norwegian',				notes: ''},
			{browser: 'nb',			mailchimp: 'no',	flag: '',	native: '"Norsk Bokmål"',			english: 'Norwegian (Bokmal)', notes: ''},
			{browser: 'nn',			mailchimp: 'ny',	flag: '',	native: '"Norsk Nynorsk"',			english: 'Norwegian (Nynorsk)',				notes: ''},
			{browser: 'nov',		mailchimp: '',		flag: '',	native: 'Novial',					english: 'Novial',				notes: ''},
			{browser: 'nrm',		mailchimp: '',		flag: '',	native: 'Nouormand',				english: 'Norman',				notes: ''},
			{browser: 'nso',		mailchimp: '',		flag: '',	native: 'Sesotho sa Leboa',			english: 'Northern Sotho',				notes: ''},
			{browser: 'nv',			mailchimp: '',		flag: '',	native: 'Diné bizaad',				english: 'Navajo',				notes: ''},
			{browser: 'ny',			mailchimp: '',		flag: '',	native: 'Chi-Chewa',				english: 'Chichewa',				notes: ''},
			{browser: 'oc',			mailchimp: '',		flag: '',	native: 'occitan',					english: 'Occitan',				notes: ''},
			{browser: 'om',			mailchimp: '',		flag: '',	native: 'Oromoo',					english: 'Oromo',				notes: ''},
			{browser: 'or',			mailchimp: '',		flag: '',	native: 'ଓଡ଼ିଆ',						english: 'Oriya',				notes: ''},
			{browser: 'os',			mailchimp: '',		flag: '',	native: 'Ирон',						english: 'Ossetic, bug 29091',				notes: ''},
			{browser: 'pa',			mailchimp: '',		flag: '',	native: 'ਪੰਜਾਬੀ',						english: 'Punjabi',				notes: ' (Gurmukhi script) (pan)'},
			{browser: 'pa-in',		mailchimp: '',		flag: '',	native: '',							english: 'Punjabi (India)',				notes: ' (Gurmukhi script) (pan)'},
			{browser: 'pa-pk',		mailchimp: '',		flag: '',	native: '',							english: 'Punjabi (Pakistan)',				notes: ' (Gurmukhi script) (pan)'},
			{browser: 'pag',		mailchimp: '',		flag: '',	native: 'Pangasinan',				english: 'Pangasinan',				notes: ''},
			{browser: 'pam',		mailchimp: '',		flag: '',	native: 'Kapampangan',				english: 'Pampanga',				notes: ''},
			{browser: 'pap',		mailchimp: '',		flag: '',	native: 'Papiamentu',				english: 'Papiamentu',				notes: ''},
			{browser: 'pcd',		mailchimp: '',		flag: '',	native: 'Picard',					english: 'Picard',				notes: ''},
			{browser: 'pdc',		mailchimp: '',		flag: '',	native: 'Deitsch',					english: 'Pennsylvania German',				notes: ''},
			{browser: 'pdt',		mailchimp: '',		flag: '',	native: 'Plautdietsch',				english: 'Plautdietsch/Mennonite Low German',				notes: ''},
			{browser: 'pfl',		mailchimp: '',		flag: '',	native: 'Pälzisch',					english: 'Palatinate German',				notes: ''},
			{browser: 'pi',			mailchimp: '',		flag: '',	native: 'पालि',						english: 'Pali',				notes: ''},
			{browser: 'pih',		mailchimp: '',		flag: '',	native: 'Norfuk / Pitkern',			english: 'Norfuk/Pitcairn/Norfolk',				notes: ''},
			{browser: 'pl',			mailchimp: 'pl',	flag: '',	native: 'polski',					english: 'Polish',				notes: ''},
			{browser: 'pms',		mailchimp: '',		flag: '',	native: 'Piemontèis',				english: 'Piedmontese',				notes: ''},
			{browser: 'pnb',		mailchimp: '',		flag: '',	native: 'پنجابی',					english: 'Western Punjabi',				notes: ''},
			{browser: 'pnt',		mailchimp: '',		flag: '',	native: 'Ποντιακά',					english: 'Pontic/Pontic Greek',				notes: ''},
			{browser: 'prg',		mailchimp: '',		flag: '',	native: 'Prūsiskan',				english: 'Prussian',				notes: ''},
			{browser: 'ps',			mailchimp: '',		flag: '',	native: 'پښتو',						english: 'Pashto, Northern/Paktu/Pakhtu/Pakhtoo/Afghan/Pakhto/Pashtu/Pushto/Yusufzai Pashto',				notes: ''},
			{browser: 'pt',			mailchimp: 'pt_PT',	flag: 'pt',	native: 'português',				english: 'Portuguese',				notes: ''},
			{browser: 'pt-br',		mailchimp: 'pt',	flag: 'br',	native: 'português do Brasil',		english: 'Brazilian Portuguese',				notes: ''},
			{browser: 'qu',			mailchimp: '',		flag: '',	native: 'Runa Simi',				english: 'Southern Quechua',				notes: ''},
			{browser: 'qug',		mailchimp: '',		flag: '',	native: 'Runa shimi',				english: 'Kichwa/Northern Quechua',				notes: '(temporarily used until Kichwa has its own)'},
			{browser: 'rgn',		mailchimp: '',		flag: '',	native: 'Rumagnôl',					english: 'Romagnol',				notes: ''},
			{browser: 'rif',		mailchimp: '',		flag: '',	native: 'Tarifit',					english: 'Tarifit',				notes: ''},
			{browser: 'rm',			mailchimp: '',		flag: '',	native: 'rumantsch',				english: 'Rhaeto-Romanic',				notes: ''},
			{browser: 'rmy',		mailchimp: '',		flag: '',	native: 'Romani',					english: 'Vlax Romany',				notes: ''},
			{browser: 'rn',			mailchimp: '',		flag: '',	native: 'Kirundi',					english: 'Rundi/Kirundi/Urundi',				notes: ''},
			{browser: 'ro',			mailchimp: 'ro',	flag: 'ro',	native: 'Română',					english: 'Romanian',				notes: ''},
			{browser: 'ro-mo',		mailchimp: 'ro',	flag: '',	native: '',							english: 'Romanian (Moldavia)',				notes: ''},
			{browser: 'roa-rup',	mailchimp: '',		flag: '',	native: 'Armãneashce',				english: 'Aromanian',				notes: 'deprecated code, \'rup\' exists in ISO 693-3)'},
			{browser: 'roa-tara',	mailchimp: '',		flag: '',	native: 'tarandíne',				english: 'Tarantino',				notes: ''},
			{browser: 'ru',			mailchimp: 'ru',	flag: 'ru',	native: 'русский',					english: 'Russian',				notes: ''},
			{browser: 'ru-mo',		mailchimp: 'ru',	flag: '',	native: '',							english: 'Russian (Moldavia)',				notes: ''},
			{browser: 'rue',		mailchimp: '',		flag: '',	native: 'русиньскый',				english: 'Rusyn',				notes: ''},
			{browser: 'rup',		mailchimp: '',		flag: '',	native: 'Armãneashce',				english: 'Aromanian',				notes: ''},
			{browser: 'ruq',		mailchimp: '',		flag: '',	native: 'Vlăheşte',					english: 'Megleno-Romanian',				notes: '(multiple scripts - defaults to Latin)'},
			{browser: 'ruq-cyrl',	mailchimp: '',		flag: '',	native: 'Влахесте',					english: 'Megleno-Romanian',				notes: '(Cyrillic script)'},
			{browser: 'ruq-grek',	mailchimp: '',		flag: '',	native: 'Βλαεστε',					english: 'Megleno-Romanian',				notes: '(Greek script)'},
			{browser: 'ruq-latn',	mailchimp: '',		flag: '',	native: 'Vlăheşte',					english: 'Megleno-Romanian',				notes: '(Latin script)'},
			{browser: 'rw',			mailchimp: '',		flag: '',	native: 'Kinyarwanda',				english: 'Kinyarwanda',				notes: 'should possibly be Kinyarwandi'},
			{browser: 'sa',			mailchimp: '',		flag: '',	native: 'संस्कृतम्',					english: 'Sanskrit',				notes: ''},
			{browser: 'sah',		mailchimp: '',		flag: '',	native: 'саха тыла',				english: 'Sakha',				notes: ''},
			{browser: 'sat',		mailchimp: '',		flag: '',	native: 'Santali',					english: 'Santali',				notes: ''},
			{browser: 'sb',			mailchimp: '',		flag: '',	native: '',							english: 'Sorbian',				notes: ''},
			{browser: 'sc',			mailchimp: '',		flag: '',	native: 'sardu',					english: 'Sardinian',				notes: ''},
			{browser: 'scn',		mailchimp: '',		flag: '',	native: 'sicilianu',				english: 'Sicilian',				notes: ''},
			{browser: 'sco',		mailchimp: '',		flag: '',	native: 'Scots',					english: 'Scots',				notes: ''},
			{browser: 'sd',			mailchimp: '',		flag: '',	native: 'سنڌي',						english: 'Sindhi',				notes: ''},
			{browser: 'sdc',		mailchimp: '',		flag: '',	native: 'Sassaresu',				english: 'Sassarese',				notes: ''},
			{browser: 'se',			mailchimp: '',		flag: '',	native: 'Davvisámegiella',			english: 'Northern Sami',				notes: ''},
			{browser: 'sei',		mailchimp: '',		flag: '',	native: 'Cmique Itom',				english: 'Seri',				notes: ''},
			{browser: 'sg',			mailchimp: '',		flag: '',	native: 'Sängö',					english: 'Sango/Sangho',				notes: ''},
			{browser: 'sgs',		mailchimp: '',		flag: '',	native: 'žemaitėška',				english: 'Samogitian',				notes: ''},
			{browser: 'sh',			mailchimp: '',		flag: '',	native: 'srpskohrvatski / српскохрватски',	english: 'Serbocroatian',				notes: ''},
			{browser: 'shi',		mailchimp: '',		flag: '',	native: 'Tašlḥiyt/ⵜⴰⵛⵍⵃⵉⵜ',			english: 'Tachelhit',				notes: '(multiple scripts - defaults to Latin)'},
			{browser: 'shi-tfng',	mailchimp: '',		flag: '',	native: 'ⵜⴰⵛⵍⵃⵉⵜ',						english: 'Tachelhit',				notes: '(Tifinagh script)'},
			{browser: 'shi-latn',	mailchimp: '',		flag: '',	native: 'Tašlḥiyt',					english: 'Tachelhit',				notes: '(Latin script)'},
			{browser: 'si',			mailchimp: '',		flag: '',	native: 'සිංහල',						english: 'Sinhalese',				notes: ''},
			{browser: 'simple',		mailchimp: '',		flag: '',	native: 'Simple English',			english: 'Simple English',				notes: ''},
			{browser: 'sk',			mailchimp: 'sk',	flag: '',	native: 'slovenčina',				english: 'Slovak',				notes: ''},
			{browser: 'sl',			mailchimp: 'sl',	flag: '',	native: 'slovenščina',				english: 'Slovenian',				notes: ''},
			{browser: 'sli',		mailchimp: '',		flag: '',	native: 'Schläsch',					english: 'Lower Selisian',				notes: ''},
			{browser: 'sm',			mailchimp: '',		flag: '',	native: 'Gagana Samoa',				english: 'Samoan',				notes: ''},
			{browser: 'sz',			mailchimp: '',		flag: '',	native: 'Åarjelsaemien',			english: 'Sami (Lappish)',				notes: ''},
			{browser: 'sn',			mailchimp: '',		flag: '',	native: 'chiShona',					english: 'Shona',				notes: ''},
			{browser: 'so',			mailchimp: '',		flag: '',	native: 'Soomaaliga',				english: 'Somani',				notes: ''},
			{browser: 'sq',			mailchimp: '',		flag: '',	native: 'shqip',					english: 'Albanian',				notes: ''},
			{browser: 'sr',			mailchimp: 'sr',	flag: '',	native: 'српски / srpski',			english: 'Serbian',				notes: '(multiple scripts - defaults to Cyrillic)'},
			{browser: 'sr-ec',		mailchimp: '',		flag: '',	native: '"српски (ћирилица)\xE2\x80\x8E"',	english: 'Serbian Cyrillic ekavian',				notes: ''},
			{browser: 'sr-el',		mailchimp: '',		flag: '',	native: '"srpski (latinica)\xE2\x80\x8E"',	english: 'Serbian Latin ekavian',				notes: ''},
			{browser: 'srn',		mailchimp: '',		flag: '',	native: 'Sranantongo',				english: 'Sranan Tongo',				notes: ''},
			{browser: 'ss',			mailchimp: '',		flag: '',	native: 'SiSwati',					english: 'Swati',				notes: ''},
			{browser: 'st',			mailchimp: '',		flag: '',	native: 'Sesotho',					english: 'Southern Sotho',				notes: ''},
			{browser: 'stq',		mailchimp: '',		flag: '',	native: 'Seeltersk',				english: 'Saterland Frisian',				notes: ''},
			{browser: 'su',			mailchimp: '',		flag: '',	native: 'Basa Sunda',				english: 'Sundanese',				notes: ''},
			{browser: 'sv',			mailchimp: 'sv',	flag: '',	native: 'svenska',					english: 'Swedish',				notes: ''},
			{browser: 'sv-fi',		mailchimp: 'sv',	flag: '',	native: '',							english: 'Swedish (Finland)',				notes: ''},
			{browser: 'sv-sv',		mailchimp: 'sv',	flag: '',	native: '',							english: 'Swedish (Sweden)',				notes: ''},
			{browser: 'sw',			mailchimp: 'sw',	flag: '',	native: 'Kiswahili',				english: 'Swahili',				notes: ''},
			{browser: 'sx',			mailchimp: '',		flag: '',	native: '',							english: 'Sutu',				notes: ''},
			{browser: 'szl',		mailchimp: '',		flag: '',	native: 'ślůnski',					english: 'Silesian',				notes: ''},
			{browser: 'ta',			mailchimp: 'ta',	flag: '',	native: 'தமிழ்',						english: 'Tamil',				notes: ''},
			{browser: 'tcy',		mailchimp: '',		flag: '',	native: 'ತುಳು',						english: 'Tulu',				notes: ''},
			{browser: 'te',			mailchimp: '',		flag: '',	native: 'తెలుగు',						english: 'Teluga',				notes: ''},
			{browser: 'tet',		mailchimp: '',		flag: '',	native: 'tetun',					english: 'Tetun',				notes: ''},
			{browser: 'tg',			mailchimp: '',		flag: '',	native: 'тоҷикӣ',					english: 'Tajiki',				notes: '(falls back to tg-cyrl)'},
			{browser: 'tg-cyrl',	mailchimp: '',		flag: '',	native: 'тоҷикӣ',					english: 'Tajiki',				notes: '(Cyrllic script) (default)'},
			{browser: 'tg-latn',	mailchimp: '',		flag: '',	native: 'tojikī',					english: 'Tajiki',				notes: '(Latin script)'},
			{browser: 'th',			mailchimp: 'th',	flag: '',	native: 'ไทย',							english: 'Thai',				notes: ''},
			{browser: 'ti',			mailchimp: '',		flag: '',	native: 'ትግርኛ',						english: 'Tigrinya',				notes: ''},
			{browser: 'tig',		mailchimp: '',		flag: '',	native: '',							english: 'Tigre',				notes: ''},
			{browser: 'tk',			mailchimp: '',		flag: '',	native: 'Türkmençe',				english: 'Turkmen',				notes: ''},
			{browser: 'tl',			mailchimp: '',		flag: '',	native: 'Tagalog',					english: 'Tagalog',				notes: ''},
			{browser: 'tlh',		mailchimp: '',		flag: '',	native: '',							english: 'Klingon',				notes: ''},
			{browser: 'tly',		mailchimp: '',		flag: '',	native: 'толышә зывон',				english: 'Talysh',				notes: ''},
			{browser: 'tn',			mailchimp: '',		flag: '',	native: 'Setswana',					english: 'Tswana',				notes: ''},
			{browser: 'to',			mailchimp: '',		flag: '',	native: 'lea faka-Tonga',			english: 'Tonga (Tonga Islands)',				notes: ''},
			{browser: 'tokipona',	mailchimp: '',		flag: '',	native: 'Toki Pona',				english: 'Toki Pona',				notes: ''},
			{browser: 'tpi',		mailchimp: '',		flag: '',	native: 'Tok Pisin',				english: 'Tok Pisin',				notes: ''},
			{browser: 'tr',			mailchimp: 'tr',	flag: '',	native: 'Türkçe',					english: 'Turkish',				notes: ''},
			{browser: 'tru',		mailchimp: '',		flag: '',	native: 'Ṫuroyo',					english: 'Turoyo',				notes: ''},
			{browser: 'ts',			mailchimp: '',		flag: '',	native: 'Xitsonga',					english: 'Tsonga',				notes: ''},
			{browser: 'tt',			mailchimp: '',		flag: '',	native: 'татарча/tatarça',			english: 'Tatar',				notes: '(multiple scripts - defaults to Cyrillic)'},
			{browser: 'tt-cyrl',	mailchimp: '',		flag: '',	native: 'татарча',					english: 'Tatar',				notes: '(Cyrillic script) (default)'},
			{browser: 'tt-latn',	mailchimp: '',		flag: '',	native: 'tatarça',					english: 'Tatar',				notes: '(Latin script)'},
			{browser: 'tum',		mailchimp: '',		flag: '',	native: 'chiTumbuka',				english: 'Tumbuka',				notes: ''},
			{browser: 'tw',			mailchimp: '',		flag: '',	native: 'Twi',						english: 'Twi',				notes: '(FIXME!)'},
			{browser: 'ty',			mailchimp: '',		flag: '',	native: 'Reo Mā`ohi',				english: 'Tahitian',				notes: ''},
			{browser: 'tyv',		mailchimp: '',		flag: '',	native: 'тыва дыл',					english: 'Tyvan',				notes: ''},
			{browser: 'udm',		mailchimp: '',		flag: '',	native: 'удмурт',					english: 'Udmurt',				notes: ''},
			{browser: 'ug',			mailchimp: '',		flag: '',	native: 'ئۇيغۇرچە / Uyghurche',		english: 'Uyghur',				notes: '(multiple scripts - defaults to Arabic)'},
			{browser: 'ug-arab',	mailchimp: '',		flag: '',	native: 'ئۇيغۇرچە',					english: 'Uyghur',				notes: '(Arabic script) (default)'},
			{browser: 'ug-latn',	mailchimp: '',		flag: '',	native: 'Uyghurche',				english: 'Uyghur',				notes: '(Latin script)'},
			{browser: 'uk',			mailchimp: 'uk',	flag: 'ua',	native: 'українська',				english: 'Ukrainian',				notes: ''},
			{browser: 'uk-ua',		mailchimp: 'uk',	flag: 'ua', native: 'українська',				english: 'Ukrainian',			notes: '' },
			{browser: 'ur',			mailchimp: '',		flag: '',	native: 'اردو',						english: 'Urdu',				notes: ''},
			{browser: 'uz',			mailchimp: '',		flag: '',	native: 'oʻzbekcha',				english: 'Uzbek',				notes: ''},
			{browser: 've',			mailchimp: '',		flag: '',	native: 'Tshivenda',				english: 'Venda',				notes: ''},
			{browser: 'vec',		mailchimp: '',		flag: '',	native: 'vèneto',					english: 'Venetian',				notes: ''},
			{browser: 'vep',		mailchimp: '',		flag: '',	native: 'vepsän kel’',				english: 'Veps',				notes: ''},
			{browser: 'vi',			mailchimp: 'vi',	flag: '',	native: 'Tiếng Việt',				english: 'Vietnamese',				notes: ''},
			{browser: 'vls',		mailchimp: '',		flag: '',	native: 'West-Vlams',				english: 'West Flemish',				notes: ''},
			{browser: 'vmf',		mailchimp: '',		flag: '',	native: 'Mainfränkisch',			english: 'Upper Franconian, Main-Franconian',				notes: ''},
			{browser: 'vo',			mailchimp: '',		flag: '',	native: 'Volapük',					english: 'Volapük',				notes: ''},
			{browser: 'vot',		mailchimp: '',		flag: '',	native: 'Vaďďa',					english: 'Vod/Votian',				notes: ''},
			{browser: 'vro',		mailchimp: '',		flag: '',	native: 'Võro',						english: 'Võro',				notes: ''},
			{browser: 'wa',			mailchimp: '',		flag: '',	native: 'walon',					english: 'Walloon',				notes: ''},
			{browser: 'war',		mailchimp: '',		flag: '',	native: 'Winaray',					english: 'Waray-Waray',				notes: ''},
			{browser: 'wo',			mailchimp: '',		flag: '',	native: 'Wolof',					english: 'Wolof',				notes: ''},
			{browser: 'wuu',		mailchimp: '',		flag: '',	native: '吴语',						english: 'Wu Chinese',				notes: ''},
			{browser: 'xal',		mailchimp: '',		flag: '',	native: 'хальмг',					english: 'Kalmyk-Oirat',				notes: ''},
			{browser: 'xh',			mailchimp: '',		flag: '',	native: 'isiXhosa',					english: 'Xhosan',				notes: ''},
			{browser: 'xmf',		mailchimp: '',		flag: '',	native: 'მარგალური',					english: 'Mingrelian',				notes: ''},
			{browser: 'yi',			mailchimp: '',		flag: '',	native: 'ייִדיש',					english: 'Yiddish',				notes: ''},
			{browser: 'yo',			mailchimp: '',		flag: '',	native: 'Yorùbá',					english: 'Yoruba',				notes: ''},
			{browser: 'yue',		mailchimp: '',		flag: '',	native: '粵語',						english: 'Cantonese',				notes: ''},
			{browser: 'za',			mailchimp: '',		flag: '',	native: 'Vahcuengh',				english: 'Zhuang',				notes: ''},
			{browser: 'zea',		mailchimp: '',		flag: '',	native: 'Zeêuws',					english: 'Zeeuws/Zeaws',				notes: ''},
			{browser: 'zh',			mailchimp: 'zh',	flag: 'cn',	native: '中文',						english: '(Zhōng Wén) - Chinese',				notes: ''},
		//	{browser: 'zh-classical',mailchimp: 'zh',	flag: 'cn',	native: '文言',						english: 'Classical Chinese/Literary Chinese',				notes: '(see bug 8217)'},
			{browser: 'zh-cn',		mailchimp: 'zh',	flag: 'cn',	native: '"中文（中国大陆）\xE2\x80\x8E"',	english: 'Chinese (PRC)',	 					notes: ''},
			{browser: 'zh-hans',	mailchimp: 'zh',	flag: 'cn',	native: '"中文（简体）\xE2\x80\x8E"',	english: 'Mandarin Chinese',					notes: '(Simplified Chinese script) (cmn-hans)'},
			{browser: 'zh-hant',	mailchimp: 'zh',	flag: 'cn',	native: '"中文（繁體）\xE2\x80\x8E"',	english: 'Mandarin Chinese',	 				notes: '(Traditional Chinese script) (cmn-hant)'},
			{browser: 'zh-hk',		mailchimp: 'zh',	flag: 'hk',	native: '"中文（香港）\xE2\x80\x8E"',	english: 'Chinese (Hong Kong)',	 				notes: ''},
			{browser: 'zh-min-nan',	mailchimp: 'zh',	flag: '',	native: 'Bân-lâm-gú',				english: 'Min-nan',	 							notes: '(see bug 8217)'},
			{browser: 'zh-mo',		mailchimp: 'zh',	flag: '',	native: '"中文（澳門）\xE2\x80\x8E"',	english: 'Chinese (Macau)',	 					notes: ''},
			{browser: 'zh-my',		mailchimp: 'zh',	flag: '',	native: '"中文（马来西亚）\xE2\x80\x8E"',	english: 'Chinese (Malaysia)',	 				notes: ''},
			{browser: 'zh-sg',		mailchimp: 'zh',	flag: '',	native: '"中文（新加坡）\xE2\x80\x8E"',	english: 'Chinese (Singapore)',	 				notes: ''},
			{browser: 'zh-tw',		mailchimp: 'zh',	flag: 'tw',	native: '"中文（台灣）\xE2\x80\x8E"',	english: 'Chinese (Taiwan)',	 				notes: ''},
			{browser: 'zh-yue',		mailchimp: 'zh',	flag: '',	native: '粵語',						english: 'Cantonese',	 						notes: '(see bug 8217)'},
			{browser: 'zu',			mailchimp: '',		flag: '',	native: 'isiZulu',					english: 'Zulu',	 							notes: ''}
		];

		// $$$ TODO  stocker le choix de langue courant dans le browser storage

		let tools				= null;
		let $i18n				= null;					// In case locale option is not given,
		//	$.i18n.debug	 = true;					// jquery.i18n plugin will use the language attribute given for the html tag.
														// If that lang attribute is also missing,
														// it will try to use the locale specified by the browser.
		const browserLang		= navigator.languages && navigator.languages[0] ||	// Chrome / Firefox
								  navigator.language ||								// All browsers
								  navigator.userLanguage;							// IE <= 10
		const browserLangLc		= browserLang.replace(/_/g, '-').toLowerCase();
		let mailchimpLanguage	= '';


		// --- private methods

		const setLocale = function(locale, callback) {
			$i18n.locale = locale;	// locale should be valid IS0 639 language codes(eg: en, ml, hi, fr, ta, etc...)
			$i18n.load('assets/i18n', locale)
				.done(function() {
					$('[data-i18n]').html(function(index) {
						const args = $(this).data('i18n').split(',');
						return $.i18n.apply(null, args);
					});
					$('body').removeClass('waiting');
					if (typeof callback === 'function') {
						callback(locale, mailchimpLanguage);
					}
				});
		};

		const selectLanguage = function(code, callback) {
			let done = false;
			$('body').addClass('waiting');
			for (let l = 0; l < locales.length; l++) {
				if (locales[l].browser === code) {
					$('#i18n-select').html('<span class="flag-icon flag-icon-' + locales[l].flag + '"></span> ' + code.toUpperCase());
					$('html').attr('lang', code);
					// $$$ TODO: $('html').attr('data-textdirection', 'ltr');
					mailchimpLanguage = locales[l].mailchimp;
					setLocale(code, callback);
					done = true;
					break;
				}
			}
			if (!done)
				$('body').removeClass('waiting');
		};


		// --- public methods

		return {

			init: function() {

				tools = window.ssw.Tools.getInstance();

				$i18n = $.i18n();
				$.i18n.fallbacks.en_GB = ['en'];
				$.i18n.fallbacks.en_UK = ['en'];
				$.i18n.fallbacks.de_DE = ['de'];
				$.i18n.fallbacks.fr_FR = ['fr'];
				$.i18n.fallbacks.fr_CA = ['fr'];
				$.i18n.fallbacks.fr_BE = ['fr'];
				$.i18n.fallbacks.fr_LU = ['fr'];
				$.i18n.fallbacks.fr_MC = ['fr'];
				$.i18n.fallbacks.fr_CH = ['fr'];

			}, // end of init:function

			buildGUI: function(initCallback, updateCallback, roles) {
				// get supported languages
				let url = '/api/I18ns/getSupportedLanguages';
				if (roles)
					url = url + '&roles=' + roles;
				$.ajax({
					type: 'POST',
					url: 'api/I18ns/getSupportedLanguages',
					data: {roles: roles},
					success: function(data) {
						// Build language menu
						let c;
						for (c = 0; c < data.languages.length; c++) {
							const code = data.languages[c];
							for (let l = 0; l < locales.length; l++) {
								if (locales[l].browser === code) {
									const flag = locales[l].flag;
									const native = locales[l].native;
									$('#i18n-menu').append('<a class="dropdown-item" href="#" data-i18n-locale="' + code + '"><span class="flag-icon flag-icon-' + flag + '"></span> ' + native + '</a>');
									break;
								}
							}
						}
						// init default (browser) language
						for (c = 0; c < data.languages.length; c++) {
							const code = data.languages[c];
							if (browserLangLc === code) {
								selectLanguage(browserLangLc, initCallback);
								break;
							}
						}
						if (c === data.languages.length) { // default browser language is not supported
							for (c = 0; c < data.languages.length; c++) {	// look for parent language
								const code = data.languages[c];
								if (code === browserLangLc.split('-')[0]) { // if (code === browserLangLc.substring(0, 2)) {
									selectLanguage(code, initCallback);
									break;
								}
							}
							if (c === data.languages.length) { // fallback not found
								selectLanguage('en', initCallback);
							}
						}
					},
					error: function(err) {
						selectLanguage('en', initCallback);
						$('#i18n').html('');
					}
				});

				// user select new language
				$('#i18n-menu').off('click.lang').on('click.lang', 'a', function(e) {
					e.preventDefault();
					selectLanguage($(this).attr('data-i18n-locale'), updateCallback);
					return false;
				});

			},

			getMailChimpLanguage: function() {
				return mailchimpLanguage;
			}, // end of getMailChimpLanguage

			dispose: function() {
			} // end of dispose

		}; // end of return

	}; // end of ssw.I18n = function() {

	// ---------- End class I18n

}(window));

// window.ssw.Tools.getInstance().addEventHandler( document, "DOMContentLoaded", window.ssw.I18n.getInstance().init(), false );

// EOF
