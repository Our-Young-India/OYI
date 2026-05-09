import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Play, Clock } from "lucide-react";

export default function StoryCard({ story, index = 0 }) {
  const thumb = story.thumbnail || (story.youtube_id ? `https://i.ytimg.com/vi/${story.youtube_id}/hqdefault.jpg` : story.photo_url);
  return (
    <Link
      to={`/stories/${story.slug}`}
      data-testid={`story-card-${story.slug}`}
      className="group block hover-lift bg-white rounded-2xl overflow-hidden border-2 border-saffron/15 hover:border-saffron/40 shadow-lg hover:shadow-2xl fade-up relative"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        {thumb ? (
          <img src={thumb} alt={story.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-saffron/20 to-india-green/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent opacity-90" />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="bg-saffron text-white text-xs font-mont font-semibold px-3 py-1 rounded-full">{story.field}</span>
        </div>
        {story.watch_time && (
          <span className="absolute top-3 right-3 bg-black/70 text-white text-xs font-mont px-2 py-1 rounded-full flex items-center gap-1">
            <Clock size={12}/> {story.watch_time}
          </span>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-saffron flex items-center justify-center shadow-lg">
            <Play className="text-white ml-1" fill="white" size={22}/>
          </div>
        </div>
      </div>
      <div className="p-5 bg-gradient-to-b from-white to-[#FFFAF0] relative">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-saffron via-yellow-400 to-india-green opacity-60"/>
        <h3 className="font-cinzel font-bold text-xl text-[#1a1a1a] mb-1 group-hover:text-saffron transition-colors">{story.name}</h3>
        <p className="font-mont text-sm text-saffron/80 font-semibold mb-3">{story.age} · {story.field}</p>
        <p className="font-mont text-[15px] text-gray-700 leading-relaxed line-clamp-2 mb-4">{story.hook || story.achievement}</p>
        <div className="flex items-center justify-between pt-3 border-t border-saffron/10">
          <span className="flex items-center gap-1 text-xs text-gray-600 font-mont font-semibold">
            <MapPin size={12} className="text-india-green"/> {story.city}, {story.state}
          </span>
          <span className="text-saffron font-mont text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">Watch →</span>
        </div>
      </div>
    </Link>
  );
}
