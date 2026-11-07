# Discrete Kalman Filter Model for Geotechnical Strata Tilt Telemetry

**Specification Version:** 1.0.0  
**Target Architecture:** MineGuard Borehole Tilt Sensor Node (sih26025)  
**Microcontroller Target:** ESP32-S3 (Xtensa Dual-Core 32-bit LX7)

---

## 1. State-Space Dynamic Formulation

Borehole inclinometer inclination angle $\theta$ and angular drift rate $\dot{\theta}$ are modeled as a linear discrete-time state vector $x_k \in \mathbb{R}^2$:

$$x_k = \begin{bmatrix} \theta_k \\ \dot{\theta}_k \end{bmatrix}$$

State transition matrix $F$ for sample period $\Delta t = 0.1\,\text{s}$ ($10\,\text{Hz}$ sampling):

$$F = \begin{bmatrix} 1 & \Delta t \\ 0 & 1 \end{bmatrix}$$

Process noise covariance matrix $Q$:

$$Q = \begin{bmatrix} \frac{\Delta t^3}{3} & \frac{\Delta t^2}{2} \\ \frac{\Delta t^2}{2} & \Delta t \end{bmatrix} \cdot \sigma_w^2$$

Where $\sigma_w^2 = 0.005\,\text{deg}^2/\text{s}^3$ represents subterranean seismic micro-vibrations.

---

## 2. Measurement Model & Innovation Filtering

The MEMS tilt accelerometer measurement $z_k$ directly observes the tilt angle:

$$H = \begin{bmatrix} 1 & 0 \end{bmatrix}, \quad R = \sigma_v^2 = 0.02\,\text{deg}^2$$

### Prediction Step:
$$\hat{x}_{k|k-1} = F \cdot \hat{x}_{k-1|k-1}$$
$$P_{k|k-1} = F \cdot P_{k-1|k-1} \cdot F^T + Q$$

### Measurement Update Step:
$$y_k = z_k - H \cdot \hat{x}_{k|k-1} \quad (\text{Measurement Residual / Innovation})$$
$$S_k = H \cdot P_{k|k-1} \cdot H^T + R$$
$$K_k = P_{k|k-1} \cdot H^T \cdot S_k^{-1} \quad (\text{Optimal Kalman Gain})$$
$$\hat{x}_{k|k} = \hat{x}_{k|k-1} + K_k \cdot y_k$$
$$P_{k|k} = (I - K_k \cdot H) \cdot P_{k|k-1}$$

This eliminates high-frequency mechanical drilling vibration noise while preserving true geotechnical strata displacement trends.
