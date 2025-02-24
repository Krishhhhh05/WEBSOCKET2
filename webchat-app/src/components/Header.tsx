const Header = () => {
    return (
      <div className="flex justify-between items-center  bg-wood-pattern relative font-questrial">
        <img src="/assets/ocean7.png" alt="ocean7" className="w-20 h-20 p-1" />
        <img
          src="/assets/logo.png"
          alt="logo"
          className="absolute left-1/2  z-20 transform -translate-x-1/2 h-40"
        />
        <div className="text-3xl font-ramaraja text-yellow-300">
          Table <br></br> 1234
        </div>
      </div>
    );
  };
export default Header;