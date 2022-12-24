export default function Custom404() {
  return (
    <main>
      <h1>404</h1>
      <h2>Oops... Sivua ei löytynyt.</h2>

      <a href="" onClick={() => history.back()}>
        &lt; Takaisin
      </a>
    </main>
  );
}
