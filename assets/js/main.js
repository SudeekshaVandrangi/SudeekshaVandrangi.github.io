// Typing effect for role
const roles = ['Data Scientist', 'Data Analyst', 'Business Analyst', 'Data Engineer'];
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingDelay = 100;
let erasingDelay = 50;
let newTextDelay = 2000; // Delay between roles

function typeEffect() {
    const currentRole = roles[roleIndex];
    const typingText = document.querySelector('.typing-text');
    
    if (isDeleting) {
        typingText.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typingText.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
    }

    if (!isDeleting && charIndex === currentRole.length) {
        isDeleting = true;
        setTimeout(typeEffect, newTextDelay);
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(typeEffect, typingDelay);
    } else {
        setTimeout(typeEffect, isDeleting ? erasingDelay : typingDelay);
    }
}

// Start the typing effect when the page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(typeEffect, 1000);
    animateOnScroll();
});

// Project Filters
document.addEventListener('DOMContentLoaded', () => {
    // Theme switching
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
    
    function updateThemeIcon(theme) {
        themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }

    // Project filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const filter = button.textContent.trim();
            
            projectCards.forEach(card => {
                if (filter === 'All') {
                    card.style.display = 'block';
                } else {
                    const category = card.getAttribute('data-category');
                    card.style.display = category === filter ? 'block' : 'none';
                }
            });
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Form submission
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Add your form submission logic here
            alert('Thank you for your message! I will get back to you soon.');
            contactForm.reset();
        });
    }
});

// Navbar background change on scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = '#fff';
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    } else {
        navbar.style.backgroundColor = 'rgba(255,255,255,0.95)';
        navbar.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
    }
});

// Add active class to nav links on scroll
window.addEventListener('scroll', function() {
    let scrollPosition = window.scrollY;
    
    document.querySelectorAll('section').forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            document.querySelector(`a[href="#${sectionId}"]`).classList.add('active');
        } else {
            document.querySelector(`a[href="#${sectionId}"]`).classList.remove('active');
        }
    });
});

// Add animation on scroll
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all sections and cards
document.querySelectorAll('section, .project-card, .exp-item').forEach(element => {
    observer.observe(element);
});

// Experience Modal Functionality
const modal = document.getElementById('experienceModal');
const closeModal = document.querySelector('.close-modal');
const experienceCards = document.querySelectorAll('.experience-card');

// Experience data
const experiences = {
    lennox: {
        logo: 'assets/images/lennox_international_logo.jpeg',
        position: 'Data Scientist Intern',
        company: 'Lennox International, TX',
        duration: 'June 2024 - August 2024',
        achievements: [
            'Designed a multivariate time series forecasting model using a Temporal Fusion Transformer trained on 9M+ data points to predict HVAC schedules for thermostat setpoints.',
            'Optimized model predictions and performance using Apache Spark and PyTorch-Forecasting by analyzing processing over 5M+ data points daily on Azure ML Studio and Databricks, increasing forecast accuracy by 10%.',
            'Implemented real-time feedback loops via Azure Communication Services, streamlining continuous improvement through email and SMS notifications.',
            'Successfully deployed the forecasting model into production, with the project set to go live in Q3 of 2025.'
        ],
        takeaways: [
            'Gained end-to-end ML deployment experience.',
            'Deepened understanding of user-centric AI solutions.'
        ],
        blogLink: {
            text: 'Click here to read more about my experience.',
            url: 'blog.html#lennox-experience'
        },
        images: []
    },
    tata: {
        logo: 'assets/images/tata_steel_processing_and_distribution_limited_logo.jpeg',
        position: 'Technical Trainee Intern',
        company: 'Tata Steel Pvt. Ltd., India',
        duration: 'May 2022 - July 2022',
        achievements: [
            'Detailed experience content will be updated soon.',
            'Stay tuned for more information about my work at Tata Steel.'
        ],
        images: []
    }
};

// Open modal when clicking on experience card
experienceCards.forEach(card => {
    card.addEventListener('click', () => {
        const experienceId = card.getAttribute('data-experience');
        const experience = experiences[experienceId];
        
        // Update modal content
        document.querySelector('.modal-logo').src = experience.logo;
        document.querySelector('.modal-position').textContent = experience.position;
        document.querySelector('.modal-company').textContent = experience.company;
        document.querySelector('.modal-duration').textContent = experience.duration;

        // Update achievements
        const achievementsList = document.createElement('ul');
        experience.achievements.forEach(achievement => {
            const li = document.createElement('li');
            li.textContent = achievement;
            achievementsList.appendChild(li);
        });
        
        const modalAchievements = document.querySelector('.modal-achievements');
        modalAchievements.innerHTML = '<h3>Key Achievements</h3>';
        modalAchievements.appendChild(achievementsList);

        // Add takeaways if they exist
        if (experience.takeaways) {
            const takeawaysSection = document.createElement('div');
            takeawaysSection.className = 'modal-takeaways';
            takeawaysSection.innerHTML = '<h3>Takeaways</h3>';
            
            const takeawaysList = document.createElement('ul');
            experience.takeaways.forEach(takeaway => {
                const li = document.createElement('li');
                li.textContent = takeaway;
                takeawaysList.appendChild(li);
            });
            
            takeawaysSection.appendChild(takeawaysList);
            modalAchievements.appendChild(takeawaysSection);
        }

        // Add blog link if it exists
        if (experience.blogLink) {
            const blogLinkSection = document.createElement('div');
            blogLinkSection.className = 'modal-blog-link';
            const blogLink = document.createElement('a');
            blogLink.href = experience.blogLink.url;
            blogLink.textContent = experience.blogLink.text;
            blogLinkSection.appendChild(blogLink);
            modalAchievements.appendChild(blogLinkSection);
        }

        // Show modal
        modal.style.display = 'block';
    });
});

// Close modal when clicking on close button or outside
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Scroll Animation
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.fade-in');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Unobserve after animation to prevent re-triggering
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: '0px 0px -50px 0px' // Adjust trigger point slightly above the viewport
    });

    elements.forEach(element => {
        observer.observe(element);
    });
};

// Notice Board Functionality
document.addEventListener('DOMContentLoaded', function() {
    const noticeBoard = document.querySelector('.notice-board');
    const toggleButton = document.querySelector('.toggle-notice');
    const whatsCooking = document.querySelector('.whats-cooking');

    // Toggle notice board
    toggleButton.addEventListener('click', function() {
        noticeBoard.classList.toggle('active');
        
        // Animate the transition
        if (noticeBoard.classList.contains('active')) {
            whatsCooking.style.transition = 'all 0.3s ease';
        } else {
            // Reset position when closing
            setTimeout(() => {
                whatsCooking.style.transition = 'all 0.3s ease';
            }, 50);
        }
    });

    // Handle mobile view
    function handleMobileView() {
        if (window.innerWidth <= 768) {
            noticeBoard.style.position = 'fixed';
            noticeBoard.style.bottom = '0';
            noticeBoard.style.top = 'auto';
            noticeBoard.style.transform = 'none';
        } else {
            noticeBoard.style.position = 'fixed';
            noticeBoard.style.right = '0';
            noticeBoard.style.top = '50%';
            noticeBoard.style.transform = 'translateY(-50%)';
        }
    }

    // Initial check
    handleMobileView();

    // Update on window resize
    window.addEventListener('resize', handleMobileView);
}); 