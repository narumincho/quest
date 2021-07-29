describe("ログイン後", () => {
  it("テストアカウントとしてログインする", () => {
    cy.visit(`http://localhost:5000/`);

    cy.get("[data-cy=logInAsTestAccount]").click();
    cy.contains("作成したプログラム");
    cy.contains("作成したプログラム");
    cy.contains("プログラム作成").click();
    cy.get("[data-cy=programNameInput]").type("やあ");
    cy.get("[data-cy=create]").click();
    cy.contains("作成しました");
    cy.contains("質問を作成する").click();
    cy.contains("質問作成");
  });
});
