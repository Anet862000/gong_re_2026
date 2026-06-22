class A_test:
    def __repr__(self):
        return "A_test 객체이다."


def main():
    print(12345)
    print(123, 'Lee', 'youn', 'woo')
    print(3.141592)
    a = A_test()
    print(a)

    print("This is", "python", "class!!", sep = "_", end = "")
    print("This is", "python", "class!!", sep = "-")

if __name__ == "__main__":
    main()