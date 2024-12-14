describe('Todo Application Tests', () => {
  beforeEach(() => {
      cy.visit('/') // Adjust this if your app is served from a different path
  })

  it('loads the initial page', () => {
      cy.contains('h1', 'Todo Liste')
  })

  it('allows users to add a new todo', () => {
      cy.get('#todo').type('New Cypress Todo')
      cy.get('#due').type('2023-01-01')
      cy.get('#status').select('offen')
      cy.get('form').submit()

      cy.contains('.todo .title', 'New Cypress Todo')
  })

  it('allows users to edit a todo', () => {
      // Assuming there's already a todo added, and it has a unique identifier or text
      cy.contains('.todo .edit', 'Bearbeiten').click()
      cy.get('#todo').clear().type('Edited Cypress Todo')
      cy.get('form').submit()

      cy.contains('.todo .title', 'Edited Cypress Todo')
  })

  it('allows users to delete a todo', () => {
      // This assumes there's a way to uniquely identify the todo to delete
      cy.contains('.todo', 'New Cypress Todo').within(() => {
          cy.get('.delete').click()
      })
      cy.should('not.contain', 'New Cypress Todo')
  })

  it('changes the status of a todo', () => {
      // Assuming there's a todo with a specific text to target
      cy.contains('.todo', 'Some Todo').within(() => {
          cy.get('.status').click()
      })
      // Verify status change, depends on how status is displayed
  })
})
