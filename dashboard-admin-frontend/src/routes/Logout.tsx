const Logout = () => {
  window.location.href = process.env.REACT_APP_LOGOUT_URL as string;

  return <div>Logout</div>;
};

export default Logout;
