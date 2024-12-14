describe('Todo App - Todo aktualisieren', () => {
    beforeEach(() => {
        // Besuchen Sie die Anwendung vor jedem Test
        cy.visit('/todo.html'); // Ersetzen Sie diesen Wert mit der tatsächlichen URL
    });

    it('soll ein neues Todo erstellen und es dann bearbeiten', () => {
        // Zuerst ein neues To do erstellen
        cy.get('#todo').type('Neues Todo für Bearbeitung');
        cy.get('#due').type('2024-12-31'); // Passen Sie das Datum nach Bedarf an
        cy.get('#status').select('offen');
        cy.get('form#todo-form input[type="submit"]').click();

        // Überprüfen, ob das neue To do in der Liste erscheint
        cy.get('#todo-list .todo').last().within(() => {
            cy.get('.title').should('contain', 'Neues Todo für Bearbeitung');
        });

        // Das neu erstellte To do bearbeiten
        cy.get('#todo-list .todo').last().within(() => {
            cy.get('.edit').click(); // Klicken Sie auf den Bearbeiten-Button
        });

        // Bearbeiten Sie die Werte im Formular
        cy.get('#todo').clear().type('Bearbeitetes Todo');
        cy.get('#due').clear().type('2025-01-01'); // Neues Datum einstellen
        cy.get('#status').select('in Bearbeitung'); // Ändern Sie den Status

        // Änderungen speichern
        cy.get('form#todo-form input[type="submit"]').click();

        // Überprüfen, ob das bearbeitete To do korrekt aktualisiert wurde
        cy.get('#todo-list .todo').last().within(() => {
            cy.get('.title').should('contain', 'Bearbeitetes Todo');
            cy.get('.status').should('contain', 'in Bearbeitung');
                // Extrahieren und Loggen des Wertes von .due
            cy.get('.due').then($due => {
                cy.log('Wert des .due-Elements:', $due.text());
                console.log('Wert des .due-Elements:', $due.text()); // Alternative mit console.log()
            });
            cy.get('.due').should('contain', '1/1/2025'); // Passen Sie das Format des Datums an, falls erforderlich
        });
    });
});
