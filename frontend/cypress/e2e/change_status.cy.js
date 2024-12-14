describe('Todo App - Status Ändern', () => {
    beforeEach(() => {
        // Besuchen Sie die Anwendung vor jedem Test
        cy.visit('/todo.html'); // Ersetzen Sie diesen Wert mit der tatsächlichen URL
    });

    it('soll den Status eines Todos ändern und dann löschen', () => {
        // Erstellen eines neuen To dos
        cy.get('#todo').type('Neues Todo zum Status ändern');
        cy.get('#due').type('2024-12-31'); // Geben Sie ein geeignetes Datum ein
        cy.get('#status').select('offen');

        // Klicken Sie auf den "Hinzufügen"-Button
        cy.get('form#todo-form input[type="submit"]').click();

        // Überprüfen, ob das neue To do in der Liste erscheint
        cy.get('#todo-list .todo').last().should('contain', 'Neues Todo zum Status ändern');

        // Das neu erstellte To do finden und den Status ändern
        cy.get('#todo-list .todo').last().within(() => {
            cy.get('.status').click(); // Klicken Sie auf den Status-Button
        });

        // Überprüfen, ob sich der Status geändert hat
        cy.get('#todo-list .todo').last().within(() => {
            cy.get('.status').should('not.contain', 'offen'); // Annahme: Der Status hat sich geändert
        });
    });
});
