"use client";

import { useState } from "react";
import KTeX from "./KTeX";

export default function MathModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        Math Context
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            {/* close */}
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>

            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
              Mathematical Context
            </h2>

            <div className="space-y-5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {/* Project description */}
              <section>
                <h3 className="mb-1 font-semibold text-gray-800 dark:text-gray-200">
                  Random Surfaces
                </h3>
                <p>
                  Imagine a 100 × 100 × 100 room in which you stack 1 × 1 × 1
                  unit cubes in a corner at random. What does the resulting pile
                  look like? Each cross-section of such a pile is a{" "}
                  <em>lattice path</em>. We study the mathematical structure of
                  these random 3-D stepped surfaces, which leads to beautiful{" "}
                  <em>limit shapes</em>.
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  — from{" "}
                  <a
                    href="https://lpetrov.cc/mel-s26/"
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    Prof. Petrov&apos;s project description
                  </a>
                </p>
              </section>

              {/* State space */}
              <section>
                <h3 className="mb-1 font-semibold text-gray-800 dark:text-gray-200">
                  State Space
                </h3>
                <p>
                  A lattice path on an N × M grid is a sequence of N
                  &ldquo;Right&rdquo; and M &ldquo;Up&rdquo; steps. The total
                  number of such paths is
                </p>
                <div className="my-2 text-center">
                  <KTeX tex="\binom{N+M}{N} = \frac{(N+M)!}{N!\,M!}" display />
                </div>
              </section>

              {/* Markov chain */}
              <section>
                <h3 className="mb-1 font-semibold text-gray-800 dark:text-gray-200">
                  Corner-Flip Markov Chain
                </h3>
                <p>
                  At each step we pick a random index{" "}
                  <KTeX tex="k \in \{0,\ldots,N{+}M{-}2\}" /> and a random
                  direction <KTeX tex="d \in \{\text{UP}, \text{DOWN}\}" />. The
                  directional corner flip is:
                </p>
                <ul className="my-2 ml-4 list-disc space-y-1">
                  <li>
                    <strong>UP:</strong>{" "}
                    <KTeX tex="\texttt{RU} \to \texttt{UR}" /> (push path
                    higher)
                  </li>
                  <li>
                    <strong>DOWN:</strong>{" "}
                    <KTeX tex="\texttt{UR} \to \texttt{RU}" /> (push path lower)
                  </li>
                </ul>
                <p>
                  This chain is <em>reversible</em> and its stationary
                  distribution is
                  <strong> uniform</strong> over all lattice paths from (0,0) to
                  (N,M).
                </p>
              </section>

              {/* Monotonicity */}
              <section>
                <h3 className="mb-1 font-semibold text-gray-800 dark:text-gray-200">
                  Monotonicity
                </h3>
                <p>
                  Define a partial order on paths: <KTeX tex="A \ge B" /> if A
                  is weakly above B on the grid. The directional corner flip
                  preserves this order:
                </p>
                <div className="my-2 text-center">
                  <KTeX
                    tex="A \ge B \;\Longrightarrow\; f(A,k,d) \ge f(B,k,d)"
                    display
                  />
                </div>
                <p>
                  where <KTeX tex="f(\cdot,k,d)" /> is the transition function.
                </p>
              </section>

              {/* Coupling */}
              <section>
                <h3 className="mb-1 font-semibold text-gray-800 dark:text-gray-200">
                  Coupling Inequality
                </h3>
                <p>
                  Run two chains from the extremes — the maximum path{" "}
                  <KTeX tex="X_0 = U^M R^N" /> and the minimum path{" "}
                  <KTeX tex="Y_0 = R^N U^M" /> — with{" "}
                  <strong>shared randomness</strong>. The coupling time{" "}
                  <KTeX tex="T_{\text{couple}} = \inf\{t : X_t = Y_t\}" />{" "}
                  gives:
                </p>
                <div className="my-2 text-center">
                  <KTeX
                    tex="d_{\text{TV}}(\mu_t,\,\pi) \;\le\; \Pr[T_{\text{couple}} > t]"
                    display
                  />
                </div>
                <p>
                  Hence the <em>mixing time</em> satisfies:
                </p>
                <div className="my-2 text-center">
                  <KTeX
                    tex="t_{\text{mix}}(\varepsilon) \;\le\; \mathbb{E}[T_{\text{couple}}]"
                    display
                  />
                </div>
              </section>

              {/* Scaling */}
              <section>
                <h3 className="mb-1 font-semibold text-gray-800 dark:text-gray-200">
                  Mixing Time Scaling
                </h3>
                <p>
                  For the N × M lattice-path chain, the mixing time scales as:
                </p>
                <div className="my-2 text-center">
                  <KTeX tex="t_{\text{mix}} = \Theta(N^2 M^2)" display />
                </div>
              </section>

              {/* Metrics */}
              <section>
                <h3 className="mb-1 font-semibold text-gray-800 dark:text-gray-200">
                  Gap Metrics
                </h3>
                <p>
                  <strong>Hamming distance:</strong>{" "}
                  <KTeX tex="d_H(A,B) = \sum_{i} \mathbf{1}[A_i \ne B_i]" />
                </p>
                <p className="mt-1">
                  <strong>Area between paths:</strong>{" "}
                  <KTeX tex="\Delta(A,B) = \sum_{\text{R-steps of }A} y_A - \sum_{\text{R-steps of }B} y_B" />
                </p>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
