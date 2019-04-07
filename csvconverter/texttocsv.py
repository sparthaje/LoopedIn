import csv
import os.path

def main():
	
  	
	file1=open("001.txt", "r")
	In_text = csv.reader(file1, delimiter = '. ')
	file3 = out_csv.writerow("Header", "Original Text", "Summary") 
	mycsv = csv.writer(open('OutPut.csv', 'w'))

	 
	file1.close()
	file2.close()


