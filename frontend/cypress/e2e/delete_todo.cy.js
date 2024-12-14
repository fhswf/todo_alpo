describe('Todo App - Todo löschen', () => {
    beforeEach(() => {
        // Besuchen Sie die Anwendung vor jedem Test
        cy.visit('/todo.html'); // Ersetzen Sie diesen Wert mit der tatsächlichen URL
    });

    it('soll ein neues Todo hinzufügen und dann löschen', () => {
        // Erstellen eines neuen To dos
        cy.get('#todo').type('Neues Todo zum Löschen');
        cy.get('#due').type('2024-12-31'); // Geben Sie ein geeignetes Datum ein
        cy.get('#status').select('offen');

        // Klicken Sie auf den "Hinzufügen"-Button
        cy.get('form#todo-form input[type="submit"]').click();

        // Überprüfen, ob das neue To do in der Liste erscheint
        cy.get('#todo-list .todo').last().should('contain', 'Neues Todo zum Löschen');
        cy.get('#todo-list .todo').last().should('contain', '12/31/2024');

        // Das neu erstellte To do löschen
        cy.get('#todo-list .todo').last().within(() => {
            cy.get('.delete').click(); // Klicken Sie auf den Löschen-Button
        });
    });
});