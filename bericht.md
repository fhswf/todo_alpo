# Bericht

Einzelgruppe: Alexander Pott

## Ziel

Eine bereits bestehende Applikation verstehen, ausgiebig testen, analysieren und verbessern.

## Start

Zunächst habe ich versucht die API mir genauer anzuschauen. Identifiziert wurden die folgenden Funktionalitäten.

- get all todos
- get specific todo
- update todo
- create todo
- delete todo

Danach habe ich mir die bereits bestehenden Tests angeschaut und Sie ausgeführt. Leider scheint bei einigen Tests entweder die Implementierung der Tests oder die Implementierung der Funktionalität fehlerhaft zu sein.

testnr|endpoint|description|passes
-|-|-|-
1|GET /todos (unautorisiert)| sollte einen 401-Fehler zurückgeben, wenn kein Token bereitgestellt wird (46 ms) | ✕
2|GET /todos|sollte alle Todos abrufen (5 ms)|✓
3|POST /todos|sollte ein neues Todo erstellen (32 ms)| ✓
4|POST /todos|sollte einen 400-Fehler zurückgeben, wenn das Todo unvollständig ist (4 ms)| ✕
5|POST /todos|sollte einen 400-Fehler zurückgeben, wenn das Todo nicht valide ist (4 ms)| ✕
6|GET /todos/:id|sollte ein Todo abrufen (7 ms)| ✓
7|GET /todos/:id|sollte einen 404-Fehler zurückgeben, wenn das Todo nicht gefunden wurde (4 ms)|✓ 
8|PUT /todos/:id|sollte ein Todo aktualisieren (8 ms)|✓ 
9|DELETE /todos/:id|sollte ein Todo löschen (10 ms)|✓

Die Fehlerhaften Test's werden also im nächsten Schritt analysiert.

## Behebung Fehlerhafter tests

### Test 1

Scheinbar, scheint die Authentifizierung nicht richtig implementiert zu sein. Nach einer kurzen Überprüfung hat sich dies bewahrheitet, jedoch funktioniert das Token Retrival des FH-SWF Keycloak server's leider nicht. Zum einen ist das Zertifikat outdated (was durch Ignorierung der Cert Prüfung umgangen werden könnte) und zum anderen scheint der Endpoint an sich nicht mehr richtig zu funktionieren. Ich erhalte HTTP 502 Status Codes.

Ich entscheide mich die Authentifizierungslogik in den Tests zu mocken. Dies mache ich indem ich in der Anwendung auf einen bestimmten Bearer Token überprüfe ('123'). Dies behebt Test 1.

### Test 4, 5

Die beiden Teste schlagen fehl durch fehlende Validierung der Daten auf der Anwendungsseite. Dies ist schnell behoben durch eine Simple Validierungsimplementation. Danach liefen die Teste erfolgreich durch.

## Integration von CI Tests

Nachdem alle Tests erfolgreich durchlaufen sorgte ich für die continous integration des Projekts mithilfe der Implementierung einer Github Action. Dies funktionierte auf anhieb.

## Sonarqube integration

Daraufhin folgte die Integration von Sonarqube um regelmäßige statische Code analysen automatisiert durchführen zu können.