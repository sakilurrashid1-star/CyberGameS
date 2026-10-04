/**
 * QuizModal.js
 * Displays knowledge checkpoint questions upon wave completion.
 * Correct answers award defense credits; incorrect answers provide remediation feedback.
 */
export class QuizModal {
  constructor(rootElement) {
    this.root = rootElement;
    this.visible = false;
    this.currentQuestion = null;
    this.onAnswer = null;
    this.modalEl = null;
    this.createModal();
  }

  createModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-quiz hidden';
    modal.innerHTML = `
      <div class="modal-overlay-quiz"></div>
      <div class="modal-window quiz-window">
        <div class="quiz-header">
          <p class="eyebrow">KNOWLEDGE CHECKPOINT</p>
          <h2>Wave Complete: Answer Challenge</h2>
          <p class="quiz-difficulty" id="quiz-difficulty">Difficulty: Medium</p>
        </div>

        <div class="quiz-content">
          <div id="quiz-question" class="quiz-question"></div>
          <div id="quiz-options" class="quiz-options"></div>
        </div>

        <div class="quiz-feedback hidden" id="quiz-feedback">
          <div class="feedback-content">
            <p id="feedback-text"></p>
            <div id="feedback-remediation" class="remediation-box"></div>
          </div>
        </div>

        <div class="quiz-actions">
          <button class="primary-btn" id="quiz-submit" disabled>Submit Answer</button>
          <button class="secondary-btn" id="quiz-skip">Skip & Continue</button>
        </div>
      </div>
    `;

    this.root.appendChild(modal);
    this.modalEl = modal;

    modal.querySelector('#quiz-skip').addEventListener('click', () => this.hide());
  }

  /**
   * Display a quiz question with multiple choice options.
   * @param {Object} question - The question object { text, options: [{text, correct, feedback}], difficulty }
   * @param {Function} onAnswer - Callback with (correct, credits, feedback)
   */
  show(question, onAnswer = null) {
    this.currentQuestion = question;
    this.onAnswer = onAnswer;

    const questionEl = document.getElementById('quiz-question');
    const optionsEl = document.getElementById('quiz-options');
    const difficultyEl = document.getElementById('quiz-difficulty');
    const feedbackEl = document.getElementById('quiz-feedback');
    const submitBtn = document.getElementById('quiz-submit');

    questionEl.textContent = question.text;
    difficultyEl.textContent = `Difficulty: ${question.difficulty || 'Medium'}`;
    optionsEl.innerHTML = '';
    feedbackEl.classList.add('hidden');
    submitBtn.disabled = true;

    question.options.forEach((option, index) => {
      const label = document.createElement('label');
      label.className = 'quiz-option';
      label.innerHTML = `
        <input type="radio" name="quiz-answer" value="${index}" />
        <span>${option.text}</span>
      `;
      label.addEventListener('change', () => {
        submitBtn.disabled = false;
      });
      optionsEl.appendChild(label);
    });

    submitBtn.onclick = () => this.submitAnswer();
    this.modalEl.classList.remove('hidden');
    this.visible = true;
  }

  hide() {
    this.modalEl.classList.add('hidden');
    this.visible = false;
  }

  /**
   * Check the selected answer and trigger feedback.
   */
  submitAnswer() {
    const selectedIndex = parseInt(
      document.querySelector('input[name="quiz-answer"]:checked')?.value ?? -1
    );

    if (selectedIndex === -1) return;

    const option = this.currentQuestion.options[selectedIndex];
    const isCorrect = option.correct || false;
    const credits = isCorrect ? 50 : 0;
    const feedback = option.feedback || 'No additional feedback available.';

    this.showFeedback(isCorrect, feedback, credits);

    if (this.onAnswer) {
      this.onAnswer({
        correct: isCorrect,
        credits,
        feedback,
        selectedIndex
      });
    }
  }

  /**
   * Display feedback and remediation content.
   * @param {Boolean} isCorrect - Whether the answer was correct
   * @param {String} feedback - Feedback text
   * @param {Number} credits - Credits awarded
   */
  showFeedback(isCorrect, feedback, credits) {
    const feedbackEl = document.getElementById('quiz-feedback');
    const feedbackText = document.getElementById('feedback-text');
    const remediationBox = document.getElementById('feedback-remediation');
    const submitBtn = document.getElementById('quiz-submit');

    if (isCorrect) {
      feedbackText.innerHTML = `<strong style="color: #6ee7b7;">✓ Correct!</strong> You earned <span style="color: #fbbf24;">${credits} Defense Credits</span>.`;
      remediationBox.textContent = `Well done. You've demonstrated solid understanding of this concept. This knowledge will reduce your operator latency in future defense scenarios.`;
    } else {
      feedbackText.innerHTML = `<strong style="color: #ff5c72;">✗ Incorrect</strong>`;
      remediationBox.innerHTML = `<strong>Remediation:</strong> ${feedback}`;
    }

    feedbackEl.classList.remove('hidden');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Continue';
    submitBtn.onclick = () => this.hide();
  }
}

/**
 * Quiz question generator aligned with curriculum modules.
 */
export const quizQuestions = {
  'module-1': [
    {
      text: 'Which TCP flag sequence indicates a completed three-way handshake?',
      difficulty: 'Easy',
      options: [
        {
          text: 'SYN, SYN-ACK, ACK',
          correct: true,
          feedback: 'The three-way handshake uses SYN (initiator), SYN-ACK (responder), and ACK (initiator) to establish a connection.'
        },
        {
          text: 'SYN, ACK, FIN',
          correct: false,
          feedback: 'FIN is used to close connections, not establish them. Review the TCP connection lifecycle.'
        },
        {
          text: 'ACK, ACK, ACK',
          correct: false,
          feedback: 'A connection cannot be established with only ACK flags. The initiator must send SYN first.'
        },
        {
          text: 'RST, SYN-ACK, ACK',
          correct: false,
          feedback: 'RST indicates a connection reset, not a successful handshake. Study normal vs. abnormal TCP states.'
        }
      ]
    },
    {
      text: 'How does an SYN flood attack exhaust server resources?',
      difficulty: 'Medium',
      options: [
        {
          text: 'By sending many SYN packets without completing the handshake, exhausting connection state tables',
          correct: true,
          feedback: 'Correct. SYN floods fill the half-open connection queue, preventing legitimate users from connecting.'
        },
        {
          text: 'By sending complete handshakes to consume bandwidth',
          correct: false,
          feedback: 'Complete handshakes use less of the connection queue. The danger of SYN floods is the incomplete state.'
        },
        {
          text: 'By manipulating TCP window size to cause buffer overflows',
          correct: false,
          feedback: 'Window size manipulation is a different attack. SYN floods focus on state exhaustion.'
        },
        {
          text: 'By sending FIN packets to close legitimate connections',
          correct: false,
          feedback: 'Sending FIN packets closes established connections, not a SYN flood. Study connection termination.'
        }
      ]
    }
  ],
  'module-2': [
    {
      text: 'Which query pattern is vulnerable to SQL injection?',
      difficulty: 'Easy',
      options: [
        {
          text: "SELECT * FROM users WHERE username = '" + input + "'",
          correct: true,
          feedback: 'Direct string concatenation allows attackers to inject SQL syntax. Use parameterized queries instead.'
        },
        {
          text: 'SELECT * FROM users WHERE username = ? (parameterized)',
          correct: false,
          feedback: 'Parameterized queries are safe. This pattern escapes user input correctly.'
        },
        {
          text: 'SELECT * FROM users WHERE username = $1 (prepared statement)',
          correct: false,
          feedback: 'Prepared statements separate code from data and are safe from injection.'
        },
        {
          text: 'SELECT * FROM users WHERE UPPER(username) = UPPER(?)',
          correct: false,
          feedback: 'This parameterized query is still safe despite the UPPER function.'
        }
      ]
    },
    {
      text: 'What does a CSRF token protect against?',
      difficulty: 'Medium',
      options: [
        {
          text: 'An attacker tricking an authenticated user into performing unintended actions',
          correct: true,
          feedback: 'CSRF tokens bind requests to a user session, preventing forged requests from other sites.'
        },
        {
          text: 'Password brute-force attacks',
          correct: false,
          feedback: 'CSRF tokens do not defend against brute force. Use rate limiting and MFA for that.'
        },
        {
          text: 'SQL injection attacks',
          correct: false,
          feedback: 'CSRF tokens are unrelated to SQL injection. Use parameterized queries to prevent injection.'
        },
        {
          text: 'Cross-site scripting (XSS)',
          correct: false,
          feedback: 'CSRF tokens do not prevent XSS. Use input validation and output encoding for XSS defense.'
        }
      ]
    }
  ],
  'module-3': [
    {
      text: 'Why is SHA-256 hash verification critical for malware defense?',
      difficulty: 'Medium',
      options: [
        {
          text: 'It ensures the downloaded file matches the known-good baseline and has not been tampered with',
          correct: true,
          feedback: 'Hash verification prevents trojanized binaries from being executed. Always compare digests before installation.'
        },
        {
          text: 'It encrypts the file so malware cannot read it',
          correct: false,
          feedback: 'Hashing does not encrypt. It produces a fingerprint for integrity verification.'
        },
        {
          text: 'It compresses the file to save disk space',
          correct: false,
          feedback: 'Hashing is not a compression mechanism. Study cryptographic hashing.'
        },
        {
          text: 'It allows the file to be reverse-engineered safely',
          correct: false,
          feedback: 'Hashing does not reverse-engineer files. It verifies integrity.'
        }
      ]
    },
    {
      text: 'What is the first step in the ransomware kill chain?',
      difficulty: 'Medium',
      options: [
        {
          text: 'Initial access via phishing, exploit, or supply-chain compromise',
          correct: true,
          feedback: 'Correct. Ransomware requires initial footing on a host before encryption. Blocking this stage is critical.'
        },
        {
          text: 'File encryption',
          correct: false,
          feedback: 'Encryption is a late stage. Attackers must establish access and persistence first.'
        },
        {
          text: 'Credential harvesting',
          correct: false,
          feedback: 'Credential theft occurs after initial access, not before. Study the attack chain.'
        },
        {
          text: 'Ransom note display',
          correct: false,
          feedback: 'The ransom note is the final stage of the attack, not the beginning.'
        }
      ]
    }
  ],
  'module-4': [
    {
      text: 'Why is salting essential for password hashing?',
      difficulty: 'Easy',
      options: [
        {
          text: 'To make each hashed password unique and prevent rainbow-table attacks',
          correct: true,
          feedback: 'Salts ensure that identical passwords produce different hashes. This defeats precomputed lookup tables.'
        },
        {
          text: 'To make passwords shorter for faster login',
          correct: false,
          feedback: 'Salts do not affect password length or login speed. Study hash salt mechanics.'
        },
        {
          text: 'To encrypt passwords so they cannot be hashed',
          correct: false,
          feedback: 'Salts are not encryption. They are additional random input to the hash function.'
        },
        {
          text: 'To allow password recovery if a user forgets their credential',
          correct: false,
          feedback: 'Salted hashes cannot be reversed for recovery. Use a password reset flow instead.'
        }
      ]
    },
    {
      text: 'What is the main advantage of asymmetric encryption over symmetric encryption?',
      difficulty: 'Medium',
      options: [
        {
          text: 'Public keys can be shared openly without compromising confidentiality; only the private key must be kept secret',
          correct: true,
          feedback: 'Asymmetric encryption solves the key distribution problem. Public keys enable secure communication without prior secret exchange.'
        },
        {
          text: 'Asymmetric encryption is faster than symmetric encryption',
          correct: false,
          feedback: 'Asymmetric encryption is computationally slower. Symmetric encryption is used for high-throughput data.'
        },
        {
          text: 'Asymmetric keys are easier to generate than symmetric keys',
          correct: false,
          feedback: 'Asymmetric key generation is more complex. Review cryptographic key types.'
        },
        {
          text: 'Asymmetric encryption produces smaller ciphertexts',
          correct: false,
          feedback: 'Asymmetric ciphertexts are typically larger. This is a trade-off for the key distribution benefit.'
        }
      ]
    }
  ],
  'module-5': [
    {
      text: 'What is the correct order of evidence preservation in incident response?',
      difficulty: 'Hard',
      options: [
        {
          text: 'Memory image, disk image, logs, network captures',
          correct: true,
          feedback: 'Memory is most volatile and must be captured first. Disk, logs, and PCAP follow in order of volatility.'
        },
        {
          text: 'Logs, disk image, memory image, network captures',
          correct: false,
          feedback: 'Logs are less volatile than memory. Capture volatile evidence first.'
        },
        {
          text: 'Network captures, memory, logs, disk',
          correct: false,
          feedback: 'Network captures are valuable but not more volatile than memory. Study evidence order of volatility.'
        },
        {
          text: 'Disk image, memory, logs, network captures',
          correct: false,
          feedback: 'Memory is more volatile than disk. Preserve memory before stopping processes.'
        }
      ]
    },
    {
      text: 'Why is log correlation important in incident triage?',
      difficulty: 'Medium',
      options: [
        {
          text: 'To connect events across systems and validate whether an alert represents a real incident or false positive',
          correct: true,
          feedback: 'Correlation separates signal from noise. A single event is suspicious, but a cross-system pattern is conclusive.'
        },
        {
          text: 'To encrypt log files for security',
          correct: false,
          feedback: 'Log encryption is separate from correlation. Correlation is about pattern detection.'
        },
        {
          text: 'To reduce the size of log storage',
          correct: false,
          feedback: 'Correlation does not reduce storage. Study log analysis and SIEM concepts.'
        },
        {
          text: 'To make logs unreadable to attackers',
          correct: false,
          feedback: 'Log obfuscation does not equal correlation. Correlation is about connecting related events.'
        }
      ]
    }
  ]
};
