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

Daraufhin folgte die Integration von Sonarqube um regelmäßige statische Code analysen automatisiert durchführen zu können. Nach ein paar Startproblemen, welche daraus entstanden sind, dass ich mir nicht bewusst war wo ich die Werte der Umgebungsvariablen/ Secrets bekommen soll lief sonarqube durch.

[Sonarqube Project TODO_ALPO](https://hopper.fh-swf.de/sonarqube/dashboard?id=todo_alpo&codeScope=overall)

Es stellte sich heraus, dass es einige Kleinigkeiten gibt, welche ich verbessern kann. Ich entschied mich Medium bis High klassifizierte Probleme in den Kategorien "Maintainability" und "Reliability" zu beheben.

## Verbesserungen

### Security Hotspots

Die Quality gate von Sonarqube läuft nun erfolgreich durch. Jedoch gibt es noch Security Hotspots. Nach einem kleinen Review entschied ich mich die 2 gefundenen Security Hotspots im Frontend von Sonarqube zu markieren, um Sonarqube zu zeigen, dass ich mir um die Probleme bewusst bin. 

Ein Hotspot war ein angeblicher Credential leak, welcher aber nur in einem Test vorkam. Dieser wurde als akzeptiert (acknowledged) markiert.

Ein weiterer Hotspot war, dass Sonarqube davon ausgeht, dass Express Versionsinformationen in seinem Webserver exposed. Dies kann natürlich von Angreifern genutzt werden um herauszufinden welche Vulnerabilities in einer bestimmten Webserver Version existieren, ist aber in diesem Kontext nicht von großer Relevanz und wurde daher als sicher (safe) markiert.

### Code coverage

Eine Sache störte mich noch. Ich habe bisher 0% Code coverage. Ich machte mich also ans Werk und began weitere Tests zu schreiben um mehr Funktionalität des Programs abzudecken. Eine Vermutung macht sich jedoch breit, dass die Code Coverade, da es ein API Test ist, sich nicht erhöhen wird. Ich müsste unit tests erstellen und Funktionen in dem Hauptteil des Programs abkapseln. Da das Hauptprogram aber sehr wenig Logik enthält entschied ich mich dazu es bei erweiterten API Tests zu belassen.

Nun schlug die Quality gate durch die fehlende Anzahl an Code Coverage bei neuem Code fehl und ich knickte ein und implementierte Unit tests, zumindest für die Datenbank Klasse.

Dies hat die Code coverage leider auch nicht verbessert. Ich entschied, dass die Anwendung, Ihrem Umfang entsprechend, gut genug getestet ist. 

## Frontend

Ich hatte mich bisher nicht mit dem Frontend auseinander gesetzt. Damit dieses funktioniert mussten einige kleine Anpassungen vorgenommen werden. Hauptsaechlich die Mock Authorization war benoetigt. 

Ich habe dann die E2E Tests hinzugefügt und noch ein paar kleine Änderungen vorgenommen, dass alles reibungslos funktioniert. Die Integration von Cypress war ein wenig frustrierend und hat am längsten gedauert.