import React from "react";
import { motion } from "motion/react";
import { Car, MapPin, Users, Target, Zap, Shield } from "lucide-react";
import mavparkLogo from "../assets/images/Mavpark.png";

function AboutUs() {
  // Team members data
  const teamMembers = [
    {
      name: "Team Member 1",
      role: "Lead Developer",
      description: "Full-stack developer specializing in real-time systems",
    },
    {
      name: "Team Member 2",
      role: "Computer Vision Engineer",
      description: "Expert in parking detection and AI systems",
    },
    {
      name: "Team Member 3",
      role: "UI/UX Designer",
      description: "Creating intuitive and beautiful user experiences",
    },
    {
      name: "Team Member 4",
      role: "Backend Engineer",
      description: "Building scalable and reliable infrastructure",
    },
  ];

  // Features of MavPark
  const features = [
    {
      icon: <MapPin className="w-6 h-4" />,
      title: "Real-Time Updates",
      description: "Get live parking availability updates as spots become available or occupied",
    },
    {
      icon: <Zap className="w-6 h-4" />,
      title: "Fast & Efficient",
      description: "Find parking spots quickly with our optimized search and navigation",
    },
    {
      icon: <Shield className="w-6 h-4" />,
      title: "Reliable Data",
      description: "Powered by advanced computer vision technology for accurate spot detection",
    },
    {
      icon: <Car className="w-6 h-4" />,
      title: "Easy Navigation",
      description: "Get directions directly to available parking spots with one click",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafbfc] relative overflow-hidden">
      {/* Advanced background with mesh gradients and patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Mesh gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-orange-100/40 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-100/30 via-transparent to-transparent"></div>
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        ></div>

        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-[600px] h-[600px] bg-purple-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000"></div>

        {/* Geometric shapes */}
        <div className="absolute top-20 right-20 w-64 h-64 border border-blue-200/20 rounded-3xl rotate-12 animate-float"></div>
        <div className="absolute bottom-32 left-32 w-48 h-48 border border-orange-200/20 rounded-full animate-float animation-delay-3000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-6">
            <img
              src={mavparkLogo}
              alt="MavPark Logo"
              className="w-32 h-32 object-contain"
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            About <span className="text-blue-600">MavPark</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Revolutionizing parking management at UTA with real-time availability tracking
          </p>
        </motion.div>

        {/* What is MavPark Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20"
        >
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-200/50">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Target className="w-8 h-8 text-blue-600" />
              What is MavPark?
            </h2>
            <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
              <p>
                <strong className="text-blue-600">MavPark</strong> is an innovative parking management system designed specifically for the University of Texas at Arlington (UTA). Our platform provides real-time parking availability information, helping students, faculty, and staff find parking spots quickly and efficiently.
              </p>
              <p>
                Using advanced computer vision technology, MavPark continuously monitors parking lots and updates spot availability in real-time. Whether you're looking for a spot near your building or planning your route to campus, MavPark ensures you always know where parking is available.
              </p>
              <p>
                Our mission is to reduce the time spent searching for parking, decrease traffic congestion, and improve the overall campus experience for the UTA community.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="bg-white/70 backdrop-blur-xl rounded-xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="bg-white/70 backdrop-blur-xl rounded-xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  {member.name.charAt(0)}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-1">
                  {member.name}
                </h3>
                <p className="text-blue-600 text-center mb-3 font-medium">
                  {member.role}
                </p>
                <p className="text-gray-600 text-center text-sm">
                  {member.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Advanced animation styles */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(50px, -80px) scale(1.1);
          }
          66% {
            transform: translate(-40px, 40px) scale(0.9);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        .animate-blob {
          animation: blob 8s ease-in-out infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default AboutUs;
