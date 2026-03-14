const fs = require('fs');
const path = require('path');

const input = `
1. Two Sum
57.2%
Easy

2. Add Two Numbers
48.1%
Med.

4. Median of Two Sorted Arrays
46.1%
Hard

7. Reverse Integer
31.6%
Med.

8. String to Integer (atoi)
20.7%
Med.

9. Palindrome Number
60.3%
Easy

12. Integer to Roman
70.6%
Med.

13. Roman to Integer
66.3%
Easy

15. 3Sum
38.7%
Med.

16. 3Sum Closest
48.2%
Med.

18. 4Sum
40.2%
Med.

19. Remove Nth Node From End of List
51.1%
Med.

20. Valid Parentheses
43.8%
Easy

21. Merge Two Sorted Lists
68.0%
Easy

26. Remove Duplicates from Sorted Array
62.4%
Easy

27. Remove Element
61.5%
Easy

28. Find the Index of the First Occurrence in a String
46.3%
Easy

29. Divide Two Integers
19.5%
Med.

34. Find First and Last Position of Element in Sorted Array
48.5%
Med.

35. Search Insert Position
50.8%
Easy

38. Count and Say
62.4%
Med.

43. Multiply Strings
43.7%
Med.

48. Rotate Image
79.4%
Med.

50. Pow(x, n)
38.3%
Med.

61. Rotate List
41.3%
Med.

66. Plus One
49.7%
Easy

67. Add Binary
57.8%
Easy

69. Sqrt(x)
41.5%
Easy

70. Climbing Stairs
53.9%
Easy

75. Sort Colors
69.3%
Med.

82. Remove Duplicates from Sorted List II
51.4%
Med.

83. Remove Duplicates from Sorted List
56.4%
Easy

88. Merge Sorted Array
54.5%
Easy

94. Binary Tree Inorder Traversal
79.8%
Easy

115. Distinct Subsequences
51.6%
Hard

121. Best Time to Buy and Sell Stock
56.5%
Easy

122. Best Time to Buy and Sell Stock II
70.8%
Med.

123. Best Time to Buy and Sell Stock III
53.3%
Hard

141. Linked List Cycle
54.0%
Easy

142. Linked List Cycle II
57.4%
Med.

144. Binary Tree Preorder Traversal
75.3%
Easy

145. Binary Tree Postorder Traversal
77.7%
Easy

148. Sort List
64.0%
Med.

150. Evaluate Reverse Polish Notation
57.2%
Med.

154. Find Minimum in Rotated Sorted Array II
44.7%
Hard

160. Intersection of Two Linked Lists
63.3%
Easy

164. Maximum Gap
51.6%
Med.

169. Majority Element
66.2%
Easy

172. Factorial Trailing Zeroes
46.3%
Med.

188. Best Time to Buy and Sell Stock IV
49.7%
Hard

189. Rotate Array
44.6%
Med.

198. House Robber
53.0%
Med.

199. Binary Tree Right Side View
69.7%
Med.

206. Reverse Linked List
80.3%
Easy

209. Minimum Size Subarray Sum
51.2%
Med.

215. Kth Largest Element in an Array
68.8%
Med.

217. Contains Duplicate
64.1%
Easy

224. Basic Calculator
46.7%
Hard

225. Implement Stack using Queues
69.5%
Easy

227. Basic Calculator II
46.7%
Med.

231. Power of Two
49.9%
Easy

234. Palindrome Linked List
57.6%
Easy

238. Product of Array Except Self
68.7%
Med.

263. Ugly Number
43.2%
Easy

268. Missing Number
71.7%
Easy

274. H-Index
41.2%
Med.

275. H-Index II
39.4%
Med.

287. Find the Duplicate Number
64.1%
Med.

303. Range Sum Query - Immutable
71.6%
Easy

309. Best Time to Buy and Sell Stock with Cooldown
61.8%
Med.

315. Count of Smaller Numbers After Self
43.3%
Hard

326. Power of Three
50.8%
Easy

328. Odd Even Linked List
62.4%
Med.

344. Reverse String
80.6%
Easy

347. Top K Frequent Elements
66.0%
Med.

349. Intersection of Two Arrays
77.6%
Easy

350. Intersection of Two Arrays II
59.7%
Easy

374. Guess Number Higher or Lower
57.2%
Easy

378. Kth Smallest Element in a Sorted Matrix
64.4%
Med.

387. First Unique Character in a String
65.1%
Easy

390. Elimination Game
46.1%
Med.

442. Find All Duplicates in an Array
76.8%
Med.

451. Sort Characters By Frequency
75.2%
Med.

507. Perfect Number
48.2%
Easy

509. Fibonacci Number
73.9%
Easy

540. Single Element in a Sorted Array
59.2%
Med.

541. Reverse String II
53.5%
Easy

557. Reverse Words in a String III
84.0%
Easy

566. Reshape the Matrix
64.8%
Easy

583. Delete Operation for Two Strings
65.3%
Med.

622. Design Circular Queue
54.1%
Med.

704. Binary Search
60.6%
Easy

707. Design Linked List
30.0%
Med.

714. Best Time to Buy and Sell Stock with Transaction Fee
71.7%
Med.

724. Find Pivot Index
62.2%
Easy

743. Network Delay Time
59.8%
Med.

771. Jewels and Stones
89.5%
Easy

796. Rotate String
65.2%
Easy

832. Flipping an Image
83.6%
Easy

867. Transpose Matrix
76.0%
Easy

876. Middle of the Linked List
81.6%
Easy

884. Uncommon Words from Two Sentences
75.6%
Easy

905. Sort Array By Parity
76.5%
Easy

912. Sort an Array
55.9%
Med.

921. Minimum Add to Make Parentheses Valid
74.4%
Med.

922. Sort Array By Parity II
71.2%
Easy

948. Bag of Tokens
59.5%
Med.

977. Squares of a Sorted Array
73.6%
Easy

1021. Remove Outermost Parentheses
86.9%
Easy

1030. Matrix Cells in Distance Order
74.0%
Easy

1047. Remove All Adjacent Duplicates In String
72.9%
Easy

1089. Duplicate Zeros
53.4%
Easy

1122. Relative Sort Array
75.2%
Easy

1137. N-th Tribonacci Number
63.3%
Easy

1143. Longest Common Subsequence
58.9%
Med.

1275. Find Winner on a Tic Tac Toe Game
54.5%
Easy

1290. Convert Binary Number in a Linked List to Integer
82.3%
Easy

1312. Minimum Insertion Steps to Make a String Palindrome
73.7%
Hard

1329. Sort the Matrix Diagonally
83.2%
Med.

1337. The K Weakest Rows in a Matrix
74.3%
Easy

1338. Reduce Array Size to The Half
69.4%
Med.

1351. Count Negative Numbers in a Sorted Matrix
79.5%
Easy

1380. Lucky Numbers in a Matrix
80.0%
Easy

1422. Maximum Score After Splitting a String
65.1%
Easy

1544. Make The String Great
68.5%
Easy

1572. Matrix Diagonal Sum
84.2%
Easy

1582. Special Positions in a Binary Matrix
72.6%
Easy

1608. Special Array With X Elements Greater Than or Equal X
66.8%
Easy

1614. Maximum Nesting Depth of the Parentheses
84.8%
Easy

1672. Richest Customer Wealth
88.7%
Easy

1700. Number of Students Unable to Eat Lunch
79.4%
Easy

1823. Find the Winner of the Circular Game
82.2%
Med.

1886. Determine Whether Matrix Can Be Obtained By Rotation
59.3%
Easy

1922. Count Good Numbers
57.4%
Med.

1971. Find if Path Exists in Graph
54.8%
Easy

2000. Reverse Prefix of Word
86.5%
Easy

2022. Convert 1D Array Into 2D Array
72.1%
Easy

2089. Find Target Indices After Sorting Array
77.9%
Easy

2095. Delete the Middle Node of a Linked List
59.5%
Med.

2133. Check if Every Row and Column Contains All Numbers
54.0%
Easy

2303. Calculate Amount Paid in Taxes
69.1%
Easy

2319. Check if Matrix Is X-Matrix
66.5%
Easy

2418. Sort the People
84.8%
Easy

2485. Find the Pivot Integer
83.8%
Easy

2500. Delete Greatest Value in Each Row
79.8%
Easy

2529. Maximum Count of Positive Integer and Negative Integer
74.3%
Easy

2574. Left and Right Sum Differences
88.0%
Easy

2576. Find the Maximum Number of Marked Indices
41.1%
Med.

2614. Prime In Diagonal
37.4%
Easy

2639. Find the Width of Columns of a Grid
70.4%
Easy

2643. Row With Maximum Ones
74.3%
Easy

2923. Find Champion I
73.3%
Easy

2946. Matrix Similarity After Cyclic Shifts
59.5%
Easy

2965. Find Missing and Repeated Values
83.2%
Easy

3033. Modify the Matrix
69.0%
Easy

3142. Check if Grid Satisfies Conditions
45.1%
Easy

3174. Clear Digits
82.7%
Easy

3194. Minimum Average of Smallest and Largest Elements
85.3%
Easy

3379. Transformed Array
70.4%
Easy

3527. Find the Most Common Response
75.0%
Med.
`;

function parseQuestions(text) {
    const lines = text.trim().split('\n').filter(l => l.trim() !== '');
    const res = [];
    for (let i = 0; i < lines.length; i += 3) {
        const titleLine = lines[i];
        const pctLine = lines[i+1];
        const diffLine = lines[i+2];
        
        if (!titleLine || !pctLine || !diffLine) break;

        const match = titleLine.match(/^(\d+)\.\s+(.*)$/);
        if (match) {
            const id = parseInt(match[1]);
            const title = match[2];
            const difficulty = diffLine === 'Med.' ? 'Medium' : diffLine;
            res.push({
                id,
                title,
                difficulty,
                leetcodeLink: `https://leetcode.com/problems/${title.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')}/`,
                solved: true, // As per request: "mark it as solved"
                bookmarked: false,
                tag: 'General'
            });
        }
    }
    return res;
}

const parsed = parseQuestions(input);
fs.writeFileSync('/tmp/parsed_questions.json', JSON.stringify(parsed, null, 2));
console.log(`Parsed ${parsed.length} questions.`);
