<?php
/**
 * La Traverse — traitement du formulaire de contact
 * - envoie le message par e-mail à Aline (fonction mail() d'Hostinger)
 * - garde une copie dans donnees/messages.log (dossier protégé par .htaccess)
 * - anti-spam : champ piège, délai minimal, limite par IP
 */

// ======== RÉGLAGES ========
$DESTINATAIRE = 'alinedebecker@gmail.com';
// Adresse d'expédition : doit appartenir au domaine du site (ex. contact@la-traverse.fr),
// sinon Gmail risque de classer les messages en spam. À créer dans Hostinger > E-mails.
$EXPEDITEUR   = 'contact@' . preg_replace('/^www\./', '', $_SERVER['HTTP_HOST'] ?? 'localhost');
$JOURNAL      = __DIR__ . '/donnees/messages.log';
$LIMITE_HEURE = 5; // envois max par IP et par heure
// ==========================

function retour(string $etat): void {
    header('Location: contact.html?envoi=' . $etat . '#contenu', true, 303);
    exit;
}
function propre(string $v, int $max): string {
    $v = trim(str_replace(["\r", "\0"], '', $v));
    return mb_substr($v, 0, $max);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') retour('err');

// Champ piège rempli ou envoi trop rapide (< 3 s) : on fait semblant que tout va bien
$t = (int)($_POST['t'] ?? 0);
if (!empty($_POST['site']) || ($t > 0 && (microtime(true) * 1000 - $t) < 3000)) retour('ok');

$nom     = propre($_POST['nom'] ?? '', 120);
$email   = propre($_POST['email'] ?? '', 160);
$tel     = propre($_POST['tel'] ?? '', 30);
$objet   = propre($_POST['objet'] ?? 'autre', 30);
$message = propre($_POST['message'] ?? '', 5000);
$ok_rgpd = !empty($_POST['consentement']);

if ($nom === '' || $message === '' || !$ok_rgpd || !filter_var($email, FILTER_VALIDATE_EMAIL)) retour('err');
if (preg_match('/[\n]/', $nom . $email . $tel)) retour('err'); // injection d'en-têtes

// Limite par IP (fichier simple, sans base de données)
if (!is_dir(dirname($JOURNAL))) @mkdir(dirname($JOURNAL), 0750, true);
$ip = $_SERVER['REMOTE_ADDR'] ?? '0';
$compteur = dirname($JOURNAL) . '/limite-' . md5($ip) . '.txt';
$envois = is_file($compteur) ? array_filter(explode("\n", (string)file_get_contents($compteur)), fn($x) => $x !== '' && (time() - (int)$x) < 3600) : [];
if (count($envois) >= $LIMITE_HEURE) retour('err');
$envois[] = time();
@file_put_contents($compteur, implode("\n", $envois), LOCK_EX);

$libelles = [
    'adulte' => 'Accompagnement (adulte)', 'parent' => 'Accompagnement parental', 'ado' => 'Adolescent / enfant',
    'formation' => 'Formation / structure', 'sante' => 'Professionnels de santé', 'chemin' => 'Un chemin pour soi', 'autre' => 'Autre',
];
$categorie = $libelles[$objet] ?? 'Autre';

$sujet = '=?UTF-8?B?' . base64_encode("[La Traverse] Nouveau message — $categorie — $nom") . '?=';
$corps = "Nouveau message depuis le site La Traverse\n"
       . "------------------------------------------\n"
       . "Nom       : $nom\n"
       . "E-mail    : $email\n"
       . "Téléphone : " . ($tel ?: '—') . "\n"
       . "Profil    : $categorie\n"
       . "Date      : " . date('d/m/Y H:i') . "\n\n"
       . "$message\n";

$entetes = implode("\r\n", [
    'From: La Traverse <' . $EXPEDITEUR . '>',
    'Reply-To: ' . $nom . ' <' . $email . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
]);

$envoye = @mail($DESTINATAIRE, $sujet, $corps, $entetes, '-f' . $EXPEDITEUR);

// Copie de sauvegarde (même si l'e-mail échoue, le message n'est pas perdu)
$ligne = json_encode([
    'date' => date('c'), 'envoye' => $envoye, 'nom' => $nom, 'email' => $email,
    'tel' => $tel, 'profil' => $categorie, 'message' => $message,
], JSON_UNESCAPED_UNICODE) . "\n";
@file_put_contents($JOURNAL, $ligne, FILE_APPEND | LOCK_EX);

retour($envoye ? 'ok' : 'err');
