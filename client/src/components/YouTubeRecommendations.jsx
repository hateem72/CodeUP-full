import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faSpinner , faCheckCircle, faCaretSquareRight} from '@fortawesome/free-solid-svg-icons';

const YouTubeRecommendations = ({ interest, hoveredNode, nodes }) => {
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [videoError, setVideoError] = useState(null);
  // const API_KEY = "AIzaSyB__A0lGjYR-OFfjbVOfKKt7eIFaYgJH1w"; 
const API_KEY = "AIzaSyBsuJnq9JL9NnMdBSdoP4giR5l7Bwt-N-8";
  useEffect(() => {
    const fetchYoutubeVideos = async (searchQuery) => {
      setIsLoadingVideos(true);
      setVideoError(null);
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${encodeURIComponent(
            searchQuery
          )}&type=video&key=${API_KEY}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch YouTube videos');
        }
        
        const data = await response.json();
        setYoutubeVideos(data.items || []);
      } catch (err) {
        console.error("YouTube API error:", err);
        setVideoError("Could not load YouTube recommendations. Please try again later.");
      } finally {
        setIsLoadingVideos(false);
      }
    };

    if (hoveredNode && nodes) {
      const node = nodes.find(n => n.id === hoveredNode);
      if (node) {
        fetchYoutubeVideos(`${interest} ${node.title}`);
      }
    } else if (interest) {
      fetchYoutubeVideos(interest);
    }
  }, [hoveredNode, interest, nodes]);

  return (
    <div className="w-full mt-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <FontAwesomeIcon icon={faCaretSquareRight} className="text-red-500 text-2xl" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
            Video Recommendations
          </h2>
        </div>

        {isLoadingVideos ? (
          <div className="flex justify-center items-center h-40">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl text-gray-400" />
          </div>
        ) : videoError ? (
          <div className="text-red-400 p-4 bg-red-900/20 rounded-lg">
            {videoError}
          </div>
        ) : (
          <div>
            <p className="text-gray-300 text-sm mb-6">
              {hoveredNode 
                ? `Recommended videos for "${nodes.find(n => n.id === hoveredNode)?.title}"`
                : `General videos about "${interest}"`}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {youtubeVideos.map((video) => (
                <motion.a
                  key={video.id.videoId}
                  href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -5 }}
                  className="block group"
                >
                  <div className="relative rounded-xl overflow-hidden bg-gray-700/50 border border-gray-600/50 transition-all group-hover:border-red-500/50 h-full">
                    <div className="relative pb-[56.25%]"> {/* 16:9 aspect ratio */}
                      <img
                        src={video.snippet.thumbnails.medium.url}
                        alt={video.snippet.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-sm font-semibold line-clamp-2">
                          {video.snippet.title}
                        </h3>
                        <p className="text-xs text-gray-300 mt-1">
                          {video.snippet.channelTitle}
                        </p>
                      </div>
                      <div className="absolute top-3 right-3 bg-black/80 rounded-full w-8 h-8 flex items-center justify-center">
                        <FontAwesomeIcon icon={faCaretSquareRight} className="text-red-500 text-xs" />
                      </div>
                      <div className="absolute top-3 left-3 bg-black/80 text-white text-xs px-2 py-1 rounded">
                        {video.snippet.publishedAt.split('T')[0]}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-300 line-clamp-2">
                        {video.snippet.description}
                      </p>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default YouTubeRecommendations;