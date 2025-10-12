
import React from "react";
import { Facebook, Instagram, Linkedin, Twitter, Youtube, Globe } from "lucide-react";
import { Separator } from "./ui/separator";

export function Footer() {
  const developers = [
    { name: "Krishna Khurana", portfolioUrl: "https://krishnakhurana.us.kg", linkedinUrl: "https://linkedin.com/in/dev1" },
    { name: "Daksh Gulati", portfolioUrl: "#", linkedinUrl: "https://linkedin.com/in/dev2" },
    { name: "Taranpreet Singh", portfolioUrl: "#", linkedinUrl: "https://linkedin.com/in/dev3" }
  ];

  return (
    <footer className="w-full border-t bg-background px-4 py-6 mt-auto">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center mb-4">
              <span className="text-3xl font-bold text-primary mr-3">SIMS</span>
              <div>
                <h3 className="font-bold text-lg">Don Bosco Institute of Technology</h3>
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center md:text-left">
              Premier Engineering College in Delhi offering quality education since 1989
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <h3 className="font-semibold text-lg mb-4">Address</h3>
            <p className="text-sm text-gray-600 text-center md:text-left">
              Adjacent to Sukhdev Vihar,<br />
              New Delhi, Delhi,<br />
              India
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <h3 className="font-semibold text-lg mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="text-gray-600 hover:text-red-600 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://instagram.com" className="text-gray-600 hover:text-red-600 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://twitter.com" className="text-gray-600 hover:text-red-600 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="https://linkedin.com" className="text-gray-600 hover:text-red-600 transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="https://youtube.com" className="text-gray-600 hover:text-red-600 transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="text-center text-sm text-gray-600 mb-4">
          &copy; {new Date().getFullYear()} Don Bosco Institute of Technology. All rights reserved.
        </div>
        
        <div className="flex flex-wrap justify-center gap-6">
          <h4 className="w-full text-center font-semibold text-gray-700 mb-2">Developed by:</h4>
          {developers.map((dev, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-sm font-medium">{dev.name}</span>
              <a href={dev.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-red-600 transition-colors">
                <Globe size={16} />
              </a>
              <a href={dev.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-red-600 transition-colors">
                <Linkedin size={16} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
