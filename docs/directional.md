
# The Directional Style

* Boxes represent nodes and lines represent relationships between the nodes.
* Each relationship is unidirectional, represented by an arrowhead.
* In addition, the relationship specifies an approximate spatial direction,
  as a compass direction (e.g. N, SE, etc), as a guide to layout.
* The syntax is a subset of a Markdown bulletted list:
  * 1st-level items are the titles of nodes, being the Origin Node in subsequent relationships.
  * 2nd-level items are:
    * relationships, if prefixed with a compass direction, e.g. `  * NE: Title of Destination Node`
    * otherwise, other attributes of the node
  * 3rd-level items are other attributes of the relationship


## Layout Algorithm

The compass-points given in the data provide a guide to layout - the layout engine
should try to respect them as far as possible, but does not guarantee them, for
example, an `E` relationship from node A to node B should, by itself, lead to nodes
A and B laid out in a horizontal line, with A to the left of B. However, other relationships
may pull them out of alignment vertically, and may even lead to A appearing to the right
of B.

### Example 1 - Straightforward
4-node cyclic groups should appear as a square.

* A
  * E: B
* B
  * S: C
* C
  * W: D
* D
  * N: A

### Example 2
2-node, symmetric relationship - 'neutral' layout.

* A
  * E: B
* B
  * E: A


### PageRank-Style Algorithm
* Treat the two dimensions independently.
* Initially position all nodes at the centre.
* Iterate a certain number of times:
  * Iterate over all relationships:
    * Imagine, e.g. an `E` relationship from A to B.
    * We need to "transfer" a proportion of A's x-position to B.
    * E.g. Bx += Ax / An, Ax -= Ax / An
    * where An is the number of relationships that originate from A.
    * For consistency, the new values should be calculated from zero
      within the iteration


* Initially position all nodes at the centre: Px = 100, Py = 100
* Iterate a certain number of times:
  * Initialize new positions, Px', Py'
  * Iterate over all relationships:
    * Bx' += Ax / An (`E` example)

