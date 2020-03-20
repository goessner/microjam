---
  "title": "Creating Web Pages with &mu;-Jam",
  "description": "A Generalized Approach to Parameterizing Planar Elliptical Arcs.",
  "tags": ["2D Vector","Graphics","Web","SVG","HTML Canvas","Path Segment"],
  "category": ["math"],
  "date": "2018-04-13",
  "template": "article"
...
# Creating Web Pages with &mu;-Jam

## A new Project


<figure>
  <img src="../mu-jam.01.png">
  <figcaption>Fig. 1: Starting with a blank editor.</figcaption>
</figure>

 



#### Stefan Gössner

*Department of Mechanical Engineering, University of Applied Sciences, Dortmund, Germany, 2019.*

**Keywords**:  four-bar linkage, Freudenstein theorem, vectorial proof, quasi-constant transmission ratio, mechanism design parameters; 


## 1. Introduction

Four-bar linkages generally have a non-constant ratio of angular velocities of their input-output links. With respect to the extreme values of this transmission ratio Freudenstein theorem states:

> *The maximum and minimum values of the transmission ratio between input-output links of a four-bar linkage occur with mechanism poses where the collineation axis is orthogonal to the coupler link*.

An interesting application of this theorem is based on the fact, that in a significant range around that configuration the transmission ratio shows a *quasi-constant* behavior with second-order accuracy. The characteristics of these extrem values are discussed in a couple of books and papers [1-6].

Ettore Pennestri discusses an approach to achieve even third-order accuracy [2].

In this paper a proof of the Freudenstein theorem based on vectors in $\mathbb R^2$ will be presented. Furthermore a four-bar linkage with a prescribed transmission ratio will be synthesized by given base link length and output link angular position and length. The problem will be solved by a graphical method as well as a vectorial approach based on loop closure equations.

 The vectorial method applied here is making use of an *orthogonal operator*. An orthogonal operator applied to a vector $\bold a$ is often written as $\bold a^{\perp}$ or $\bold a_{\perp}$. Here it is denoted in a more compact way as $\tilde\bold a$, reflecting the skew-symmetry of its operator matrix. See [7] for rules used with it. 

## 2. Four-Bar Prerequisites

<figure>
<g-2 id='g' width="501" height="401" cartesian darkmode x0="-50" y0="-30">
{ "main":[
    {"c":"lin","a":{"x1":100,"y1":100,"x2":500,"y2":100,"lw":15,"ls":"green"}},
    {"c":"lin","a":{"x1":100,"y1":50,"x2":500,"y2":50,"lw":3,"ls":"red"}},
    {"c":"ply","a":{"pts":[100,150,500,150,500,300],"closed":true,"lw":5,"fs":"#bcd","ls":"brown"}},
    {"c":"use","a":{"grp":"cirgrp","x":200,"y":300}}
  ],
  "cirgrp":[
    {"c":"cir","a":{"x":0,"y":0,"r":100,"lw":3,"ls":"#333","fs":"orange"}}
  ]
}
</g-2>
  <figcaption>Fig. 1: Notations used with a four-bar linkage</figcaption>
</figure>

The four-bar mechanism in figure 1 is extended by its two nontrivial poles $P$ between coupler and frame and the relative pole $I$ between input and output link. The relative pole $I$ in agreement to the Aronhold-Kennedy theorem is located in the intersection point of base line $A_0B_0$ and coupler line $AB$. 

### 2.1 Loop Closure Equation

Let $\bold a, \bold b, \bold c, \bold d$ be the four vectors building the single loop of a four-bar mechanism according to figure 1. It reads

$$\bold a + \bold b + \bold c - \bold d ~=~ \bold 0\,.$$ (1)

Four lengths and base orientation are constant. The three variable orientations are $\varphi, \theta, \psi$ belonging to links $\bold a, \bold b, \bold c$. So the total differential of equation (1) with respect to these is

$$\tilde\bold a d\varphi + \tilde\bold b d\theta + \tilde\bold c d\psi ~=~ \bold 0\,.$$ (2)

## References

[1]  J.J. Uicker et al., *Theory of Machines and Mechanisms.* Oxford Press, 2011, ISBN 978-0-19-977781-5  
[2]  G. Figliolini, E. Pennestri, *Synthesis of Quasi-Constant Transmission Ratio Planar Linkages*, Journal of Mechanical Design, 2015, DOI: 10.1115/1.4031058    
[3]  I. Nulle, E. Kronbergs, A. Kakitis, O. Vronskis, *Modeling of Mechanisms of quasi-constant Movement*, University of Life Sciences and Technologies, Latvia, 2018, DOI: 10.22616/ERDev2018.17.N368   
[4]  E.A. Dijksman, *Motion Geometry of Mechanisms*, Cambridge University Press, 1976, ISBN 0-521-20841-6  
[5]  L. Hagedorn, W. Thonfeld, A. Rankers, *Konstruktive Getriebelehre*, Springer Berlin, Heidelberg, 2009, ISBN 978-3-642-01613-4   
[6] R.S. Hartenberg, J. Denavit, *Kinematic Synthesis of Linkages*, McGraw-Hill, 1964   
[7]  S. Gössner, *Coordinate Free Vector Algebra in $\mathbb R^2$*, 
Researchgate, 2018, DOI: 10.13140/RG.2.2.19280.76805   
[8] S. Gössner, Mechanismentechnik – Vektorielle Analyse ebener Mechanismen, Logos, Berlin, 2017, ISBN 978-3-8325-4362-4  

