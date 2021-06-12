import React from 'react';
import './TrendingProjects.css';
import star from './../../assets/star.svg';
import Project from '../Project/Project';

function TrendingProjects(props) {
  return (
    <div className="conatiner">
      <img src={star} className="star-logo" />
      <h2 className="best_project--title">Trending Projects</h2>
      <div className="flex-box">
        <Project
          title="E-Commerce Website"
          desc=""
          skills={['MongoDB', 'Express', 'React', 'Node']}
          level="Beginner"
          rating={5}
        />
        <Project
          title="Online Distance Education System"
          desc=""
          skills={['MongoDB', 'Express', 'React', 'Node']}
          level="Advance"
          rating={5}
        />
        <Project
          title="E-Learning Portal"
          desc=""
          skills={['MongoDB', 'Express', 'React', 'Node']}
          level="Advanced"
          rating={4}
        />
        <Project
          title="Virtual Queue Management System"
          desc=""
          skills={['MongoDB', 'Express', 'React', 'Node']}
          level="Advanced"
          rating={4}
        />
      </div>
    </div>
  );
}

export default TrendingProjects;
