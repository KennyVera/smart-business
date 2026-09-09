import logoSmartBusiness from "../../../assets/logo-smart-business.png";

function LoginBrand() {
  return (
    <div className="login-brand">
      <img
        className="login-logo"
        src={logoSmartBusiness}
        alt="Smart Business"
        width={220}
        height={220}
      />
    </div>
  );
}

export default LoginBrand;
