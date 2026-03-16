import React, { useState, useEffect } from 'react';
import { Search, Upload, User, FileText, Users, Bell, Menu, X } from 'lucide-react';
import { NavLink } from "react-router-dom";
import './styles/SidePane.css';

function SidePane() {

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isOpen, setIsOpen] = useState(false);

   useEffect(() => {
        function handleResize() {
            setWindowWidth(window.innerWidth);
        }

        window.addEventListener('resize', handleResize);

        // Cleanup listener on unmount
        return () => window.removeEventListener('resize', handleResize);
    }, []);

  const isDesktop = windowWidth >= 768;

  const menuItems = [
    { icon: Search, label: 'Search Resources', color: 'blue', nav: '/search-resources' },
    { icon: Upload, label: 'Upload Resource', color: 'gray', nav: '/upload-resource'},
    { icon: User, label: 'Profile', color: 'gray', nav: '/my-profile'},
    { icon: FileText, label: 'My Contributions', color: 'gray', nav: '/my-contributions'},
    { icon: Users, label: 'Followers', color: 'gray', nav: '/followers'},
    { icon: Bell, label: 'Notifications', color: 'gray', nav: '/notifications'}
  ];

  return (
    <>
      {/* Hamburger Button - Only show on mobile */}
      {!isDesktop && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hamburger-btn"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X size={24} color="#374151" />
          ) : (
            <Menu size={24} color="#374151" />
          )}
        </button>
      )}

      {/* Overlay - Only show on mobile when open */}
      {!isDesktop && isOpen && (
        <div
          className="overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Side Pane */}
      <div 
        className={`side-pane ${isDesktop ? 'desktop' : ''} ${isOpen || isDesktop ? 'open' : ''}`}
      >
        <div className="menu-container">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink 
                key={index} 
                to={item.nav}
                onClick={() => !isDesktop && setIsOpen(false)}
              >
                <button className="menu-item">
                  <Icon className={`menu-icon ${item.color}`} />
                  <span className="menu-label">{item.label}</span>
                </button>
              </NavLink>
            );
          })}
        </div>
      </div>
    </>
  )
}

export default SidePane;