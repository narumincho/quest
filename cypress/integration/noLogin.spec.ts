beforeEach(() => {
  indexedDB.deleteDatabase("main");
});

describe("ログイン前", () => {
  it("最初に訪れたとき, LINEでログインボタンが表示される", () => {
    cy.visit("http://localhost:5000");

    cy.contains("LINE で ログイン");
  });
});
