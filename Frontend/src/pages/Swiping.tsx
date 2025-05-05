import React, { useState, useMemo, useRef } from 'react';
import TinderCard from 'react-tinder-card';
import './Swiping.css';

// buttons
import leftButtonImg from '../assets/buttons/leftButtonImg.svg';
import rightButtonImg from '../assets/buttons/rightButtonImg.svg';
import roseIcon from '../assets/buttons/roseIcon.png';

// hardcoded character images
import richardImg from '../assets/img/richard.jpg';
import erlichImg from '../assets/img/erlich.jpg';
import monicaImg from '../assets/img/monica.jpg';
import jaredImg from '../assets/img/jared.jpg';
import dineshImg from '../assets/img/dinesh.jpg';


interface Character {
  name: string;
  url: string;
  position: string;
  tags: string[];
  description: string; 
}

const db: Character[] = [
  { 
    name: 'Richard Hendricks', 
    url: richardImg,
    position: 'Software Engineer',
    tags: ['Techie', 'Developer', 'Programmer'],
    description: 'A talented software engineer focused on building scalable solutions for startups.'
  },
  { 
    name: 'Erlich Bachman', 
    url: erlichImg,
    position: 'Startup Incubator',
    tags: ['Dog Lover', 'Backend', 'SQL'],
    description: 'A confident and charismatic startup guru who loves making business connections.'
  },
  { 
    name: 'Monica Hall', 
    url: monicaImg,
    position: 'UX/UI Design',
    tags: ['Figma', 'React', 'Quirky'],
    description: 'A passionate UX/UI designer with a keen eye for user-centric design.'
  },
  { 
    name: 'Jared Dunn', 
    url: jaredImg,
    position: 'CEO',
    tags: ['Nonchalant', 'Chill', '12X TA', 'That guy'],
    description: 'A calm and composed CEO with a strategic vision for growth and innovation.'
  },
  { 
    name: 'Dinesh Chugtai', 
    url: dineshImg,
    position: 'Startup Incubator',
    tags: ['Bouldering', 'Data Science', 'Entrepenuer', 'boppy'],
    description: 'An ambitious entrepreneur with a deep interest in data science and climbing.'
  },
];

const Swiping: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(db.length - 1);
  const [lastDirection, setLastDirection] = useState<string | undefined>();
  
  const currentIndexRef = useRef<number>(currentIndex);
  const childRefs = useMemo(
    () => Array(db.length).fill(0).map(() => React.createRef<TinderCard>()),
    []
  );

  const updateCurrentIndex = (val: number): void => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  const canGoBack = currentIndex < db.length - 1;
  const canSwipe = currentIndex >= 0;

  const swiped = async (direction: string, swiped: string, index: number): Promise<void> => {
    setLastDirection(direction);
    updateCurrentIndex(index - 1);
  
    if (direction === 'right') {
      console.log(`You swiped right on ${swiped}`);
  
      // Send request to backend to record the swipe
      try {
        const response = await fetch('/api/swipe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            swipedUserID: "currenrt", // Replace with actual current user from login info
            swipeType: direction,
          }),
        });
  
        const data = await response.json();
        if (data.match) {
          alert(`You matched with ${swiped}!`);
        }
      } catch (error) {
        console.error('Error sending swipe data:', error);
      }
    }
  };

  const outOfFrame = (name: string, idx: number): void => {
    console.log(`${name} (${idx}) left the screen!`, currentIndexRef.current);
    if (currentIndexRef.current >= idx) {
      childRefs[idx].current?.restoreCard();
    }
  };

  const swipe = async (dir: string): Promise<void> => {
    if (canSwipe && currentIndex < db.length) {
      await childRefs[currentIndex].current?.swipe(dir);
    }
  };

  const goBack = async (): Promise<void> => {
    if (!canGoBack) return;
    const newIndex = currentIndex + 1;
    updateCurrentIndex(newIndex);
    await childRefs[newIndex].current?.restoreCard();
  };

  return (
    <div className="app">
      <link href='https://fonts.googleapis.com/css?family=Damion&display=swap' rel='stylesheet' />
      <link href='https://fonts.googleapis.com/css?family=Alatsi&display=swap' rel='stylesheet' />
      <h1>React Tinder Card</h1>
      <h2>University of Washington</h2>
      <div className='cardContainer'>
        {db.map((character, index) => (
          <TinderCard
            ref={childRefs[index]}
            className='swipe'
            key={character.name}
            onSwipe={(dir: string) => swiped(dir, character.name, index)}
            onCardLeftScreen={() => outOfFrame(character.name, index)}
          >
            <div style={{ backgroundImage: `url(${character.url})` }} className='card'>
                {/* Rose Icon Button at the top left */}
                <button className="roseButton" onClick={() => console.log("Rose icon clicked!")}>
                    <img src={roseIcon} alt="Rose Icon" />
                </button>
                
                <div className="info-section">
                    <h3>{character.name}</h3>
                    <span className="position">{character.position}</span>
                    
                    {/* Description Section */}
                    <p className="description">{character.description}</p>

                    {/* Tags Section */}
                    <div className="tags">
                    {character.tags.map((tag, index) => (
                        <div key={index} className="tag">
                        {tag}
                        </div>
                    ))}
                    </div>

                </div>
            </div>
          </TinderCard>
        ))}
      </div>
      <div className='buttons'>
        
        <button style={{ 
            backgroundColor: canSwipe ? '#FFFFFF' : undefined,
            border: '1px solid #D9D9D9'  /* Add the 1px border here */}} 
        onClick={() => swipe('left')}>
        <img src={leftButtonImg} alt="Swipe Left" />
        </button>

        <button style={{ 
            backgroundColor: canGoBack ? '#1970FF' : undefined,
            lineHeight: '18px',
            fontSize: '15px',  /* Set the font size here */ }} 
            onClick={() => goBack()}>
          Undo swipe!
        </button>

        <button style={{ backgroundColor: canSwipe ? '#1BB5C6' : undefined }} onClick={() => swipe('right')}>
          <img src={rightButtonImg} alt="Swipe Right" />
        </button>
      </div>
      {lastDirection ? (
        <h2 key={lastDirection} className='infoText'>
          You swiped {lastDirection}
        </h2>
      ) : (
        <h2 className='infoText'>
          Swipe a card or press a button to get Restore Card button visible!
        </h2>
      )}
    </div>
  );
};

export default Swiping;
