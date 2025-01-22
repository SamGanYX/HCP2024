import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Make sure to install react-router-dom if not already installed

const InvestorDetails = () => {
  interface Investor {
    id: number;
    name: string;
    email: string;
    description: string;
    expertise: string;
    investmentRange: string;
    Qualifications: string;
    Location: string;
    Certifications: string;
    Tags: string;
    ContactInfo: string;
  }

  const [investor, setInvestor] = useState<Investor | null>(null);
  const { id } = useParams<{ id: string }>(); // Get the investor ID from the URL

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/investors/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setInvestor(data);
      })
      .catch((err) => console.log(err));
  }, [id]);

  if (!investor) {
    return <div>Loading...</div>; // Show loading state while fetching data
  }

  return (
    <div className="container">
      <h1 className="text-2xl font-bold mb-4">Investor Details</h1>
      <div className="details">
        <p><strong>Name:</strong> {investor.name}</p>
        <p><strong>Email:</strong> {investor.email}</p>
        <p><strong>Description:</strong> {investor.description}</p>
        <p><strong>Expertise:</strong> {investor.expertise}</p>
        <p><strong>Investment Range:</strong> {investor.investmentRange}</p>
        <p><strong>Qualifications:</strong> {investor.Qualifications}</p>
        <p><strong>Location:</strong> {investor.Location}</p>
        <p><strong>Certifications:</strong> {investor.Certifications}</p>
        <p><strong>Tags:</strong> {investor.Tags}</p>
        <p><strong>Contact Info:</strong> {investor.ContactInfo}</p>
      </div>
    </div>
  );
};

export default InvestorDetails;
