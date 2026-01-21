/**
 * Punjab Board Curriculum Data
 * Based on latest curriculum issued by Punjab Board of Education
 */

import type { Board, Grade, Subject, Chapter } from '../types';

// ============================================================================
// Punjab Board Definition
// ============================================================================

export const punjabBoard: Board = {
    id: 'punjab-board',
    name: 'Punjab Board of Education',
    shortName: 'Punjab Board',
    description: 'Official curriculum from the Punjab Board of Education, featuring the latest course materials for Secondary and Higher Secondary education.',
    issueDate: '2024',
    region: 'Punjab, Pakistan',
    isActive: true,
};

// ============================================================================
// Grades
// ============================================================================

export const grades: Grade[] = [
    {
        id: 'punjab-9th',
        name: '9th Grade',
        shortName: '9th',
        boardId: 'punjab-board',
        order: 9,
        subjectIds: ['punjab-9th-physics'],
    },
    {
        id: 'punjab-10th',
        name: '10th Grade',
        shortName: '10th',
        boardId: 'punjab-board',
        order: 10,
        subjectIds: ['punjab-10th-physics'],
    },
    {
        id: 'punjab-11th',
        name: '11th Grade',
        shortName: '11th',
        boardId: 'punjab-board',
        order: 11,
        subjectIds: [], // Coming soon
    },
    {
        id: 'punjab-12th',
        name: '12th Grade',
        shortName: '12th',
        boardId: 'punjab-board',
        order: 12,
        subjectIds: [], // Coming soon
    },
];

// ============================================================================
// Subjects
// ============================================================================

export const subjects: Subject[] = [
    // 9th Grade Physics
    {
        id: 'punjab-9th-physics',
        name: 'Physics',
        gradeId: 'punjab-9th',
        icon: '⚛️',
        accentColor: 'from-blue-500 to-cyan-500',
        chapterIds: [
            'punjab-9th-physics-ch1',
            'punjab-9th-physics-ch2',
            'punjab-9th-physics-ch3',
            'punjab-9th-physics-ch4',
            'punjab-9th-physics-ch5',
            'punjab-9th-physics-ch6',
            'punjab-9th-physics-ch7',
            'punjab-9th-physics-ch8',
            'punjab-9th-physics-ch9',
        ],
        hasPOPQuiz: true,
    },
    // 10th Grade Physics
    {
        id: 'punjab-10th-physics',
        name: 'Physics',
        gradeId: 'punjab-10th',
        icon: '⚛️',
        accentColor: 'from-blue-500 to-cyan-500',
        chapterIds: [
            'punjab-10th-physics-ch10',
            'punjab-10th-physics-ch11',
            'punjab-10th-physics-ch12',
            'punjab-10th-physics-ch13',
            'punjab-10th-physics-ch14',
            'punjab-10th-physics-ch15',
            'punjab-10th-physics-ch16',
            'punjab-10th-physics-ch17',
            'punjab-10th-physics-ch18',
        ],
        hasPOPQuiz: true,
    },
];

// ============================================================================
// Chapters - 9th Grade Physics (Chapters 1-9)
// ============================================================================

export const chapters9thPhysics: Chapter[] = [
    {
        id: 'punjab-9th-physics-ch1',
        name: 'Physical Quantities and Measurements',
        subjectId: 'punjab-9th-physics',
        order: 1,
        questions: [],
        isLocked: false,
    },
    {
        id: 'punjab-9th-physics-ch2',
        name: 'Kinematics',
        subjectId: 'punjab-9th-physics',
        order: 2,
        questions: [],
        isLocked: false,
    },
    {
        id: 'punjab-9th-physics-ch3',
        name: 'Dynamics',
        subjectId: 'punjab-9th-physics',
        order: 3,
        questions: [],
        isLocked: false,
    },
    {
        id: 'punjab-9th-physics-ch4',
        name: 'Turning Effects of Force',
        subjectId: 'punjab-9th-physics',
        order: 4,
        questions: [],
        isLocked: false,
    },
    {
        id: 'punjab-9th-physics-ch5',
        name: 'Work, Energy and Power',
        subjectId: 'punjab-9th-physics',
        order: 5,
        questions: [],
        isLocked: false,
    },
    {
        id: 'punjab-9th-physics-ch6',
        name: 'Mechanical Properties of Matter',
        subjectId: 'punjab-9th-physics',
        order: 6,
        questions: [],
        isLocked: false,
    },
    {
        id: 'punjab-9th-physics-ch7',
        name: 'Thermal Properties of Matter',
        subjectId: 'punjab-9th-physics',
        order: 7,
        questions: [],
        isLocked: false,
    },
    {
        id: 'punjab-9th-physics-ch8',
        name: 'Magnetism',
        subjectId: 'punjab-9th-physics',
        order: 8,
        questions: [],
        isLocked: false,
    },
    {
        id: 'punjab-9th-physics-ch9',
        name: 'Nature of Science',
        subjectId: 'punjab-9th-physics',
        order: 9,
        questions: [],
        isLocked: false,
    },
];

// ============================================================================
// Chapters - 10th Grade Physics (Chapters 10-18)
// ============================================================================

export const chapters10thPhysics: Chapter[] = [
    {
        id: 'punjab-10th-physics-ch10',
        name: 'Simple Harmonic Motion and Waves',
        subjectId: 'punjab-10th-physics',
        order: 10,
        questions: [],
        isLocked: false,
    },
    {
        id: 'punjab-10th-physics-ch11',
        name: 'Sound',
        subjectId: 'punjab-10th-physics',
        order: 11,
        questions: [],
        isLocked: false,
    },
    {
        id: 'punjab-10th-physics-ch12',
        name: 'Geometrical Optics',
        subjectId: 'punjab-10th-physics',
        order: 12,
        questions: [],
        isLocked: false,
    },
    {
        id: 'punjab-10th-physics-ch13',
        name: 'Electrostatics',
        subjectId: 'punjab-10th-physics',
        order: 13,
        questions: [],
        isLocked: false,
    },
    {
        id: 'punjab-10th-physics-ch14',
        name: 'Current Electricity',
        subjectId: 'punjab-10th-physics',
        order: 14,
        questions: [],
        isLocked: false,
    },
    {
        id: 'punjab-10th-physics-ch15',
        name: 'Electromagnetism',
        subjectId: 'punjab-10th-physics',
        order: 15,
        questions: [],
        isLocked: false,
    },
    {
        id: 'punjab-10th-physics-ch16',
        name: 'Basic Electronics',
        subjectId: 'punjab-10th-physics',
        order: 16,
        questions: [],
        isLocked: false,
    },
    {
        id: 'punjab-10th-physics-ch17',
        name: 'Information and Communication Technology',
        subjectId: 'punjab-10th-physics',
        order: 17,
        questions: [],
        isLocked: false,
    },
    {
        id: 'punjab-10th-physics-ch18',
        name: 'Atomic and Nuclear Physics',
        subjectId: 'punjab-10th-physics',
        order: 18,
        questions: [],
        isLocked: false,
    },
];

// ============================================================================
// All Chapters Combined
// ============================================================================

export const allChapters: Chapter[] = [...chapters9thPhysics, ...chapters10thPhysics];

// ============================================================================
// Chapter SLOs (Student Learning Outcomes) - For reference and quiz generation
// ============================================================================

export const chapterSLOs: Record<string, string[]> = {
    // Chapter 1 - Physical Quantities and Measurements
    'punjab-9th-physics-ch1': [
        'Differentiate between physical and non-physical quantities',
        'Explain with examples that physics is based on physical quantities (magnitude and unit)',
        'Differentiate between base and derived physical quantities and units',
        'Use the seven units of System International (SI) with their symbols',
        'Analyse and express numerical data using scientific notation',
        'Analyse and express numerical data using prefixes',
        'Justify and illustrate the use of common lab instruments to measure length',
        'Justify and illustrate the use of measuring cylinders to measure volume',
        'Justify and illustrate how to measure time intervals using lab instruments',
        'Identify and explain common sources of human and systematic errors',
        'Determine an average value for empirical readings and describe significant figures',
        'Differentiate between precision and accuracy',
        'Round off and justify measured estimates to make them reasonable',
        'Determine the least count of a data-collection instrument',
    ],

    // Chapter 2 - Kinematics
    'punjab-9th-physics-ch2': [
        'Differentiate between scalar and vector quantities',
        'Justify that distance, speed, time, mass, energy, temperature are scalar quantities',
        'Justify that displacement, force, weight, velocity, acceleration are vector quantities',
        'Determine graphically the resultant of two or more vectors',
        'Differentiate between translatory, rotational, and vibratory motion',
        'Differentiate between distance and displacement, speed and velocity',
        'Define and calculate average speed',
        'Differentiate between average and instantaneous speed',
        'Differentiate between uniform and non-uniform velocity',
        'Define and calculate acceleration',
        'Differentiate between uniform and non-uniform acceleration',
        'Sketch, plot and interpret distance-time and speed-time graphs',
        'Use g ≈ 10 m/s² for free-fall acceleration problems',
        'Analyse distance travelled in speed-time graphs',
        'Calculate acceleration from the gradient of a speed-time graph',
        'State universal speed limit ≈ 3 × 10⁸ m/s',
    ],

    // Chapter 3 - Dynamics
    'punjab-9th-physics-ch3': [
        'Illustrate that mass is a measure of the quantity of matter',
        'Explain that mass resists change in motion (inertia)',
        'Describe universal gravitation and gravity',
        'Define and calculate weight',
        'Define and calculate gravitational field strength',
        'Justify use of mechanical and electronic balances to measure mass',
        'Justify use of a force meter (spring balance) to measure weight',
        'Differentiate between contact and non-contact forces',
        'Differentiate between types of forces (weight, friction, tension, etc.)',
        'State four fundamental forces and describe relative strengths',
        'Represent forces using free body diagrams',
        'State and apply Newton\'s first law',
        'Identify effect of force on velocity',
        'Determine the resultant of two or more forces',
        'State and apply Newton\'s second law',
        'State and apply Newton\'s third law with examples',
        'State limitations of Newton\'s laws',
        'Analyse dissipative effect of friction',
        'Analyse dynamics reaching terminal velocity',
        'Differentiate rolling and sliding friction',
        'Justify methods to reduce friction',
        'Define and calculate momentum',
        'Define and calculate impulse',
        'Apply conservation of momentum in one dimension',
        'Define resultant force in terms of momentum',
    ],

    // Chapter 4 - Turning Effects of Force
    'punjab-9th-physics-ch4': [
        'Differentiate between like and unlike parallel forces',
        'Analyse problems involving turning effects of forces',
        'State what is meant by centre of mass and centre of gravity',
        'Describe how to determine centre of gravity',
        'Describe and identify states of equilibrium',
        'Analyse effect of position of centre of gravity on stability',
        'Propose how stability can be improved',
        'Illustrate applications of stability physics',
        'Predict qualitatively motion of rotating bodies',
        'Describe qualitatively motion in a circular path due to centripetal force',
        'Identify sources of centripetal force in real life examples',
    ],

    // Chapter 5 - Work, Energy and Power
    'punjab-9th-physics-ch5': [
        'Define work done',
        'Use the equation W = F × d',
        'Define energy as ability to do work',
        'Explain that energy may be stored in various forms',
        'Prove kinetic energy formula',
        'Prove and use gravitational potential energy formula',
        'Use energy formulas to solve problems',
        'Describe how energy is transferred and stored',
        'State and apply conservation of energy',
        'Justify why perpetual energy machines don\'t work',
        'Differentiate between renewable and non-renewable energy sources',
        'Describe how useful energy may be obtained from natural resources',
        'Describe advantages and disadvantages of energy generation methods',
        'Define and calculate power',
        'Define and calculate efficiency',
        'Apply concept of efficiency to problems',
        'State that a system cannot have 100% efficiency',
    ],

    // Chapter 6 - Mechanical Properties of Matter
    'punjab-9th-physics-ch6': [
        'Illustrate that forces may produce change in size and shape',
        'Define and calculate the spring constant',
        'Sketch, plot and interpret load-extension graphs',
        'Define limit of proportionality',
        'Illustrate applications of Hooke\'s law',
        'Define and calculate density',
        'Define and calculate pressure',
        'Describe how pressure varies with force and area',
        'Describe pressure at a surface',
        'Justify that the atmosphere exerts pressure',
        'Describe how atmospheric pressure decreases with height',
        'Explain that changes in atmospheric pressure may indicate weather changes',
        'Analyse workings and applications of a liquid barometer',
        'Justify how pressure varies with depth in a liquid',
        'Describe the working of a manometer',
        'Define and apply Pascal\'s law',
    ],

    // Chapter 7 - Thermal Properties of Matter
    'punjab-9th-physics-ch7': [
        'Describe qualitatively particle structure of solids, liquids and gases',
        'Describe plasma as a fourth state of matter',
        'Describe relationship between motion of particles and temperature',
        'State that an increase in temperature increases internal energy',
        'Explain how a physical property varying with temperature may be used to measure temperature',
        'Justify the need for fixed points in thermometer calibration',
        'Illustrate sensitivity, range and linearity of thermometers',
        'Differentiate between liquid-in-glass and thermocouple thermometers',
        'Discuss how structure affects thermometer characteristics',
    ],

    // Chapter 8 - Magnetism
    'punjab-9th-physics-ch8': [
        'Describe forces between magnetic poles and materials',
        'Describe induced magnetism',
        'Differentiate temporary and permanent magnets',
        'Describe magnetic fields',
        'State direction of magnetic field at a point',
        'State that relative strength of field is shown by spacing of lines',
        'Describe uses of permanent magnets and electromagnets',
        'Explain qualitatively domain theory of magnetism',
        'Differentiate ferromagnetic, paramagnetic and diamagnetic materials',
        'Analyse applications of magnets in recording technology',
        'State that soft magnetic materials can provide shielding from magnetic fields',
    ],

    // Chapter 9 - Nature of Science
    'punjab-9th-physics-ch9': [
        'Describe physics as the study of matter, energy, space, time and their interactions',
        'Explain with examples that physics has many sub-fields and interdisciplinary fields',
        'Explain with examples how physics is a subset of the physical and natural sciences',
        'Explain that science is collaborative and interdisciplinary',
        'Understand terms hypothesis, theory and law in physics',
        'Explain falsifiability in scientific theories',
        'Differentiate the terms science, technology and engineering',
    ],

    // Chapter 10 - Simple Harmonic Motion and Waves
    'punjab-10th-physics-ch10': [
        'Explain conditions necessary for an object to oscillate with simple harmonic motion (SHM)',
        'Describe and illustrate SHM with examples such as mass-spring system and simple pendulum',
        'Describe behaviour of oscillating systems and relate restoring force to displacement',
        'Define and use terms related to SHM: period, frequency, amplitude, displacement',
        'Describe wave motion and distinguish between transverse and longitudinal waves',
        'Apply the general wave equation and solve problems involving wave speed, frequency and wavelength',
    ],

    // Chapter 11 - Sound
    'punjab-10th-physics-ch11': [
        'Explain how sound waves are produced and propagated through a medium',
        'Describe characteristics of sound (pitch, loudness, quality)',
        'Explain reflection of sound and concepts like echo and reverberation',
        'Analyze the speed of sound in different media and factors affecting it',
        'Discuss applications of sound, including acoustics and ultrasonics',
    ],

    // Chapter 12 - Geometrical Optics
    'punjab-10th-physics-ch12': [
        'State and apply the laws of reflection and refraction for light on plane and curved surfaces',
        'Use mirror and lens formulas for image location and magnification',
        'Describe refraction through prisms and conditions for total internal reflection',
        'Explain optical instruments such as simple microscopes and telescopes',
        'Apply concepts of human eye and vision defects in problem solving',
    ],

    // Chapter 13 - Electrostatics
    'punjab-10th-physics-ch13': [
        'Describe production of electric charges and electrostatic induction',
        'Explain electroscope operation and applications',
        'State and use Coulomb\'s law for forces between charges',
        'Define electric field, field intensity and electric potential',
        'Describe capacitors, capacitance and factors affecting them',
    ],

    // Chapter 14 - Current Electricity
    'punjab-10th-physics-ch14': [
        'Define electric current and describe the flow of charge in conductors',
        'Distinguish between conventional current and electron flow',
        'Define potential difference and electromotive force (emf)',
        'Explain Ohm\'s law and use it to solve numerical problems',
        'Define resistance and resistivity and describe factors affecting them',
        'Represent electrical circuits using standard symbols and diagram conventions',
        'Solve problems involving series and parallel circuits',
        'Define electrical energy and electrical power and calculate them for different circuits',
        'Describe practical applications of Ohm\'s law in household and industrial electrical systems',
        'Analyze experimental setups to measure current, voltage, and resistance accurately',
        'Discuss safety precautions in electric circuits, including fuses and earthing',
    ],

    // Chapter 15 - Electromagnetism
    'punjab-10th-physics-ch15': [
        'Describe the magnetic effect of current and magnetic field around straight conductors, loops, and solenoids',
        'Define the direction of magnetic field using the right-hand rule',
        'Explain force on a current-carrying conductor in a magnetic field (Lorentz force) and applications',
        'Describe electromagnetic induction and Faraday\'s law',
        'Explain Lenz\'s law and use it to predict direction of induced currents',
        'Describe working principles of transformers, AC and DC generators, and alternators',
        'Apply knowledge of electromagnetism to practical devices',
        'Solve numerical problems involving magnetic force, induced emf, and transformer ratios',
        'Discuss the effects of changing current, magnetic field, or area on induced emf',
        'Illustrate real-life applications of electromagnetic induction in power generation',
    ],

    // Chapter 16 - Basic Electronics
    'punjab-10th-physics-ch16': [
        'Explain thermionic emission and behaviour of electrons in a vacuum',
        'Describe the structure and working of diodes, transistors, and other semiconductor devices',
        'Understand p-n junction, forward and reverse bias in diodes',
        'Use diodes to build basic circuits like rectifiers and voltage regulators',
        'Explain transistor operation and its use as a switch and amplifier',
        'Understand logic gates (AND, OR, NOT) and their representation in circuits',
        'Describe the function of a cathode ray oscilloscope (CRO) and its applications',
        'Solve problems involving simple electronic circuits',
        'Discuss real-life applications of electronic devices in communication and measurement systems',
        'Explain safety precautions while handling electronic components',
    ],

    // Chapter 17 - Information and Communication Technology
    'punjab-10th-physics-ch17': [
        'Define information and describe the importance of accurate, timely, and relevant information',
        'Explain the generation, processing, storage, and transmission of information',
        'Describe digital signals, analog signals, and their differences',
        'Explain the role of transducers in converting physical quantities to electrical signals',
        'Describe components of a communication system: transmitter, channel, receiver',
        'Explain types of communication: wired, wireless, optical fiber, satellite',
        'Discuss data compression, coding, and error detection techniques',
        'Describe real-life applications of ICT in education, business, and healthcare',
        'Illustrate basic networking concepts: LAN, WAN, Internet, intranet',
        'Analyze the advantages and limitations of ICT systems in society',
    ],

    // Chapter 18 - Atomic and Nuclear Physics
    'punjab-10th-physics-ch18': [
        'Describe the structure of an atom, including protons, neutrons, and electrons',
        'Define isotopes, isobars, and their properties',
        'Explain natural radioactivity and its types: alpha, beta, gamma',
        'Describe artificial radioactivity and nuclear reactions',
        'Define half-life and solve numerical problems related to radioactive decay',
        'Explain the concept of binding energy and mass defect',
        'Discuss nuclear fission and fusion and their energy applications',
        'Describe uses of radioisotopes in medicine, industry, and agriculture',
        'Analyze safety measures and hazards associated with radioactive materials',
        'Solve problems involving nuclear reactions, decay, and energy calculations',
    ],
};
