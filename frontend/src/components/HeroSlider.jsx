import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { heroSlides } from "../../js/data.js";

export default function HeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroSlides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  function applySlide(index) {
    setActiveIndex((index + heroSlides.length) % heroSlides.length);
  }

  return (
    <div className="hero-slider">
      {heroSlides.map((slide, index) => (
        <article
          key={slide.productSlug}
          className={`hero-slide ${index === activeIndex ? "is-active" : ""}`}
        >
          <div className="hero-slide__content">
            <p className="eyebrow">{slide.eyebrow}</p>
            <h1>{slide.title}</h1>
            <p>{slide.subtitle}</p>
            <Link className="button button--primary" to={`/product/${slide.productSlug}`}>
              {slide.cta}
            </Link>
          </div>
          <div className="hero-slide__visual">
            <img src={slide.image} alt={slide.title} />
          </div>
        </article>
      ))}

      <div className="hero-slider__controls">
        <div className="hero-slider__dots">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.productSlug}
              className={index === activeIndex ? "is-active" : ""}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => applySlide(index)}
            />
          ))}
        </div>
        <div className="hero-slider__buttons">
          <button type="button" onClick={() => applySlide(activeIndex - 1)}>Prev</button>
          <button type="button" onClick={() => applySlide(activeIndex + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
}
