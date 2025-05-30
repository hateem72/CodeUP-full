import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import Logo from "../assets/Clogo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSignOutAlt, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-background text-octonary p-4 flex justify-between items-center shadow-lg bg-blurred-dark sticky top-0 z-50">
      
      <div className="flex items-center">
        <img
          src={Logo}
          alt="CODEUP Logo"
          className="h-12 w-auto object-contain transition-transform duration-300 hover:scale-105"
          onClick={() => navigate("/dashboard")}
          style={{ cursor: "pointer" }}
        />
      </div>

      
      {user && (
        <>
          
          <button
            className="md:hidden text-senary focus:outline-none"
            onClick={toggleMenu}
          >
            <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} size="lg" />
          </button>

          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-senary hover:text-teal transition-colors duration-200 font-medium"
              >
                Dashboard
              </button>
              {/* <button
                onClick={() => navigate("/roadmap")}
                className="text-senary hover:text-teal transition-colors duration-200 font-medium"
              >
                Roadmap
              </button> */}
              <button
                onClick={() => navigate("/workspaces")}
                className="text-senary hover:text-teal transition-colors duration-200 font-medium"
              >
                Workspaces
              </button>
            </nav>
            <div className="flex items-center space-x-4">
              <span className="text-senary italic font-medium flex items-center">
                <FontAwesomeIcon icon={faUser} className="mr-2 text-teal" />
                {user.displayName}
              </span>
              <button
                onClick={logout}
                className="bg-quaternary px-4 py-2 rounded-lg hover:bg-tertiary text-octonary transition-colors duration-200 font-semibold flex items-center space-x-2"
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          <div
            className={`${
              isMenuOpen ? "flex" : "hidden"
            } md:hidden absolute top-16 left-0 w-full bg-background shadow-lg flex-col items-center space-y-4 py-4 transition-all duration-300`}
          >
            <button
              onClick={() => {
                navigate("/dashboard");
                setIsMenuOpen(false);
              }}
              className="text-senary hover:text-teal transition-colors duration-200 font-medium"
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                navigate("/workspaces");
                setIsMenuOpen(false);
              }}
              className="text-senary hover:text-teal transition-colors duration-200 font-medium"
            >
              Workspaces
            </button>
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faUser} className="text-teal" />
              <span className="text-senary font-medium">{user.displayName}</span>
            </div>
            <button
              onClick={() => {
                logout();
                setIsMenuOpen(false);
              }}
              className="bg-quaternary px-4 py-2 rounded-lg hover:bg-tertiary text-octonary transition-colors duration-200 font-semibold flex items-center space-x-2"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Logout</span>
            </button>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;