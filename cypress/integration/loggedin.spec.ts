describe("ログイン後", () => {
  const accountToken =
    "a5b7058a6c75fe48875a8591abe7a49f82f5c3aaf52614f4fbc971ae9db1c91b";
  it("アカウントトークンを使ってログインする", () => {
    cy.visit(`http://localhost:5000/#account-token=${accountToken}`);

    cy.contains("作成したプログラム");
    cy.url().should("not.include", accountToken);
    cy.contains("作成したプログラム");
    cy.contains("プログラム作成").click();
    cy.get("[data-cy=programNameInput]").type("やあ");
    cy.get("[data-cy=create]").click();
    cy.contains("作成しました");
    cy.contains("質問を作成する").click();
    cy.contains("質問 新規作成");
  });
});
