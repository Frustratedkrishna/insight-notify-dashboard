
import React from "react";
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { Separator } from "./ui/separator";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background px-4 py-6 mt-auto">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center mb-4">
              {/* College Logo */}
              <div className="w-12 h-12 bg-red-600 flex items-center justify-center rounded-full mr-3">
                <span className="text-white font-bold text-xl">DBIT</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">Don Bosco Institute of Technology</h3>
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center md:text-left">
              Premier Engineering College in Mumbai offering quality education since 1989
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <h3 className="font-semibold text-lg mb-4">Address</h3>
            <p className="text-sm text-gray-600 text-center md:text-left">
              Premier Automobiles Road,<br />
              Kurla West, Mumbai,<br />
              Maharashtra 400070
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
        
        <div className="text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} Don Bosco Institute of Technology. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
